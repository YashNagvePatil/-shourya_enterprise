# 🔐 Authentication System

## Overview

The Shourya Enterprise platform implements a robust authentication system that supports multiple user roles — **Agent**, **Admin**, and **Franchise**. The system uses **JWT (JSON Web Tokens)** for stateless authentication, **bcryptjs** for password hashing, **cookie-based token storage** for security, and **Redis session caching** for high-performance user lookups.

---

## Table of Contents

- [How Registration Works](#how-registration-works)
- [How Login Works](#how-login-works)
- [How Logout Works](#how-logout-works)
- [JWT Token Management](#jwt-token-management)
- [Authentication Middleware](#authentication-middleware)
- [Redis Session Caching](#redis-session-caching)
- [Protected Routes (Frontend)](#protected-routes-frontend)
- [Input Validation](#input-validation)
- [File References](#file-references)

---

## How Registration Works

### Agent Registration Flow

1. **User fills out** the registration form with: full name, email, contact number, password, and sponsor/parent agent ID.
2. **Frontend dispatches** a Redux action that calls `POST /api/auth/register`.
3. **Backend validates** the input using `express-validator` rules defined in `auth.validator.js`.
4. **Backend checks** if the email or contact already exists in the database.
5. **A unique Distributor ID** is generated (e.g., `AGT1001`, `AGT1002`, etc.).
6. **Binary tree placement**: The agent is placed under the parent agent in the binary tree. The system finds the next available position (left or right) under the specified parent.
7. **Password is hashed** using bcryptjs (salt rounds = 10) via a Mongoose `pre('save')` hook.
8. **The agent record** is created in MongoDB with status `Pending` and `isActivated: false`.
9. **A JWT token** is generated and sent back as an HTTP-only cookie.

```
Client                    Server                    Database
  │                         │                          │
  │  POST /api/auth/register│                          │
  │─────────────────────────►│                          │
  │                         │  Validate Input           │
  │                         │──────────────────────────►│
  │                         │  Check Duplicate Email    │
  │                         │──────────────────────────►│
  │                         │  Generate Distributor ID  │
  │                         │  Place in Binary Tree     │
  │                         │  Hash Password (bcrypt)   │
  │                         │  Create User Document     │
  │                         │──────────────────────────►│
  │                         │  Generate JWT Token       │
  │  Set Cookie + Response  │                          │
  │◄─────────────────────────│                          │
```

### Franchise Registration Flow

1. **Franchise owner fills out** a comprehensive form including:
   - Personal details (name, email, mobile, password)
   - Franchise type (VILLAGE / CITY / DISTRICT / STATE)
   - Address details (state, district, city, taluka, village)
   - Business documents (Udyam Number, Firm Docs, Shop License)
   - KYC documents (PAN Card image, Aadhaar Card image)
   - Bank details (Account Number, IFSC, Bank Name)
2. **Documents are uploaded** to Cloudinary via the storage service.
3. **Backend creates** a franchise record with status `Pending`.
4. **Admin must verify** the KYC documents and approve the franchise before it becomes active.

---

## How Login Works

1. **User submits** email and password via the login form.
2. **Frontend dispatches** a Redux action that calls `POST /api/auth/login`.
3. **Backend searches** for the user across multiple collections in this order:
   - First checks the `Admin` collection
   - Then checks the `User` (Agent) collection
   - Finally checks the `Franchise` collection
4. **Password comparison** is done using `bcrypt.compare()` via the `comparePassword()` instance method.
5. **If credentials match**, a JWT token is generated containing `{ id, role }`.
6. **Token is set** as an HTTP-only, secure cookie with a defined expiration.
7. **User data** (without password) is returned in the response.

### Login Response Structure

```json
{
  "success": true,
  "message": "Login Successful!",
  "user": {
    "_id": "64abc...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "Agent",
    "status": "Active",
    "distributerId": "AGT1001"
  }
}
```

---

## How Logout Works

1. **Frontend calls** `POST /api/auth/logout`.
2. **Backend clears** the JWT cookie by setting it to an empty string with `maxAge: 0`.
3. **Redis cache** for the user session is invalidated (cleared).
4. **Frontend clears** the Redux auth state and redirects to the login page.

---

## JWT Token Management

### Token Generation

```javascript
const token = jwt.sign(
  { id: user._id, role: user.role },
  config.JWT_SECRET,
  { expiresIn: "7d" }
);
```

### Token Storage

- The token is stored as an **HTTP-only cookie** named `token`.
- This prevents JavaScript from accessing the token (XSS protection).
- The cookie is sent automatically with every request due to `credentials: true` in the CORS configuration.

### Token Retrieval (Middleware)

The authentication middleware supports two methods of token retrieval:

1. **Cookie**: `req.cookies?.token` (primary method)
2. **Authorization Header**: `Bearer <token>` (fallback for API tools)

---

## Authentication Middleware

The `authenticateUser` middleware (`backend/middlewares/agent.middleware.js`) is an enterprise-level authentication gate that:

1. **Extracts the JWT token** from cookies or the Authorization header.
2. **Verifies the token** using `jwt.verify()` with the JWT_SECRET.
3. **Checks Redis cache** for a cached user session (avoids DB lookup on every request).
4. **Falls back to MongoDB** if cache miss — queries the correct collection based on the role in the JWT payload (Admin → `adminModel`, Franchise → `franchiseModel`, Agent → `userModel`).
5. **Caches the user** in Redis for 180 seconds (3 minutes) after a successful DB lookup.
6. **Checks account status** — blocks access if status is `BLOCKED`, `INACTIVE`, `REJECTED`, or `SUSPENDED`.
7. **Attaches `req.user`** with the full user object (minus password) for use in controllers.

### Error Handling

| Error Type | HTTP Status | Message |
|---|---|---|
| Missing Token | 401 | Access Denied! Authorization token missing. |
| Invalid Payload | 401 | Invalid token payload structure. |
| User Not Found | 401 | Unauthorized! User session no longer exists. |
| Account Blocked | 403 | Your account status is Blocked. Access restricted. |
| Token Expired | 401 | Session expired. Please log in again. |
| Invalid Token | 401 | Invalid authentication token signature. |

---

## Redis Session Caching

- When a user logs in and their data is fetched from MongoDB, it is cached in Redis with the key pattern: `user_session:<userId>`.
- Cache TTL: **180 seconds (3 minutes)**.
- On subsequent requests within the TTL, the middleware reads from Redis instead of MongoDB, drastically reducing database load.
- If Redis is unavailable (connection issues), the system gracefully falls back to direct MongoDB queries.

---

## Protected Routes (Frontend)

The `Protected.jsx` component wraps route groups that require authentication and specific roles:

```jsx
<Protected allowedRoles={['Agent']}>
  <Outlet />
</Protected>
```

### How It Works

1. Checks if a user is logged in (via Redux auth state).
2. Verifies if the user's role is included in the `allowedRoles` array.
3. If not authenticated → redirects to `/login`.
4. If role mismatch → redirects to the homepage or shows an unauthorized message.

### Role-Based Route Groups

| Route Prefix | Required Role | Description |
|---|---|---|
| `/agent/*` | `Agent` | Agent dashboard, wallet, network, profile |
| `/admin/*` | `Admin` | Admin panel, management tools |
| `/franchise/*` | `Franchise` | Franchise dashboard, inventory, finance |

---

## Input Validation

Request body validation is handled by **express-validator** in `backend/validators/auth.validator.js`.

### Registration Validation Rules

- `fullName` — Required, trimmed, minimum 2 characters
- `email` — Required, valid email format, normalized
- `contact` — Required, numeric, 10 digits
- `password` — Required, minimum 6 characters

### Login Validation Rules

- `email` — Required, valid email format
- `password` — Required, non-empty

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/controllers/auth.controller.js` | Registration, Login, Logout logic |
| `backend/middlewares/agent.middleware.js` | JWT verification + Redis caching middleware |
| `backend/routes/auth.routes.js` | Auth route definitions |
| `backend/validators/auth.validator.js` | Input validation rules |
| `backend/config/config.js` | JWT_SECRET and other environment configs |
| `backend/config/cacheRedis.js` | Redis client setup and cache middleware |
| `backend/models/user.models.js` | Agent schema with password hashing hooks |
| `backend/models/admin.model.js` | Admin schema |
| `backend/models/franchise.model.js` | Franchise schema with password hashing |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/auth/pages/Register.jsx` | Registration form page |
| `Frontend/src/features/auth/pages/Login.jsx` | Login form page |
| `Frontend/src/features/auth/state/auth.slice.js` | Auth Redux slice (login/register/logout) |
| `Frontend/src/features/auth/service/` | Auth API service layer |
| `Frontend/src/features/auth/hook/` | Custom auth hooks |
| `Frontend/src/components/Protected.jsx` | Route protection component |
| `Frontend/src/App/App.routes.jsx` | Route definitions with role-based protection |
