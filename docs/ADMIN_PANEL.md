# 🛡 Admin Panel

## Overview

The Admin Panel is the central control hub of the Shourya Enterprise platform. It provides the administrator with full visibility and control over all agents, franchises, products, inventory, payouts, and financial operations. The admin dashboard features analytics with charts, agent management tools, franchise KYC verification, product creation, inventory management, and payout processing.

---

## Table of Contents

- [Admin Dashboard](#admin-dashboard)
- [Agent Management](#agent-management)
- [Product Management](#product-management)
- [Inventory Management](#inventory-management)
- [Payout Management](#payout-management)
- [Franchise Management Module](#franchise-management-module)
- [Admin Authentication](#admin-authentication)
- [Admin Routes & Access Control](#admin-routes--access-control)
- [File References](#file-references)

---

## Admin Dashboard

### Route: `/admin/dashboard`

The Admin Dashboard is the first page the admin sees after login. It provides a comprehensive overview of the platform's health.

### Dashboard Metrics

| Metric | Description |
|---|---|
| **Total Agents** | Total number of registered agents |
| **Active Agents** | Agents with `isActivated: true` |
| **Pending Agents** | Agents with status `Pending` |
| **Blocked Agents** | Agents with status `Blocked` |
| **Total Revenue** | Sum of all completed payments |
| **Pending Payouts** | Total withdrawal requests pending approval |
| **Total Products** | Number of products in the catalog |
| **Total Franchises** | Number of registered franchises |
| **Franchise Revenue** | Revenue from franchise operations |

### Analytics Charts (Recharts)

- 📊 **Agent Growth** — Registration trends over time
- 📈 **Revenue Trends** — Monthly/weekly revenue charts
- 🥧 **Agent Status Distribution** — Pie chart (Active/Pending/Blocked)
- 📉 **BV Distribution** — Left vs Right BV comparison
- 📊 **Payout History** — Monthly payout amounts

### API: `GET /api/admin/dashboard`

Returns all analytics data in a single optimized API call.

---

## Agent Management

### Agent List Page (`/admin/agentList`)

A comprehensive list of all agents with:

1. **Search** — Search by name, email, distributor ID
2. **Filters** — Filter by status (Active/Pending/Blocked), rank, activation status
3. **Pagination** — Paginated results for performance
4. **Quick Actions** — Activate, block, or view details

### API: `GET /api/admin/agent/management`

Query Parameters:
| Parameter | Description |
|---|---|
| `search` | Search term (name, email, distributor ID) |
| `status` | Filter by status |
| `page` | Page number |
| `limit` | Items per page |
| `sortBy` | Sort field |
| `sortOrder` | asc / desc |

### Agent Details Page (`/admin/agentDetails`)

Detailed view of a single agent showing:

1. **Personal Info** — Name, email, contact, distributor ID, rank
2. **Account Status** — Current status with toggle action
3. **KYC Details** — PAN Card, Aadhaar Card images with status
4. **Bank Details** — Account number, IFSC, bank name, UPI
5. **Binary Tree Position** — Parent, sponsor, left/right children
6. **Team Stats** — Total directs, left/right team counts
7. **Financial Summary** — Wallet balance, total earnings, bonuses
8. **BV Statistics** — Left/Right BV, total BV counters
9. **Address** — Shipping address

### Agent Status Toggle

```
Admin clicks "Block" or "Activate"
        │
        ▼
PATCH /api/admin/agent/status/:id
{ status: "Active" | "Blocked" }
        │
        ▼
Update agent status in MongoDB
Invalidate Redis session cache
        │
        ▼
Agent's access is immediately affected
(Blocked agents receive 403 on next request)
```

---

## Product Management

### Create Product Page (`/admin/createProduct`)

A comprehensive form for creating new products with all MLM-specific fields.

### Form Sections

1. **Basic Details** — Name, SKU, Description, Short Description, Brand
2. **Pricing** — MRP, Distributor Price, BV, PV, Direct Commission, GST %
3. **Category** — BEST SELLERS / FEATURED COLLECTION / EXECUTIVE BUNDLES / NEW ARRIVALS
4. **Inventory** — Initial stock quantity
5. **MLM Configuration** — Is Activation Package, Package Tier
6. **Franchise Supply** — Available for franchise supply, Supply Category
7. **Images** — Upload multiple product images (Cloudinary)

### API: `POST /api/admin/createProduct`

See [PRODUCT_MANAGEMENT.md](./PRODUCT_MANAGEMENT.md) for detailed documentation.

---

## Inventory Management

### Inventory Page (`/admin/inventory`)

The inventory page provides:

1. **Stock Overview** — All items with current quantities
2. **Purchase Stock** — Add stock to items
3. **Deduct Stock** — Remove stock (damage, corrections)
4. **Low Stock Alerts** — Items below minimum threshold
5. **Stock Value** — Total inventory value calculation

### APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/inventory/list` | List all inventory items |
| `GET` | `/api/admin/inventory/:itemId` | Get specific item details |
| `POST` | `/api/admin/inventory/purchase` | Purchase stock |
| `POST` | `/api/admin/inventory/deduct` | Deduct stock |

See [INVENTORY_MANAGEMENT.md](./INVENTORY_MANAGEMENT.md) for detailed documentation.

---

## Payout Management

### Agent Payout Page (`/admin/agentPayout`)

Manages all agent withdrawal requests:

### Features

1. **View All Requests** — List of pending, approved, and rejected requests
2. **Filter by Status** — Quick filters for request status
3. **View Agent Details** — Click to see agent profile and bank details
4. **Process Payout** — Approve and trigger Razorpay bank transfer
5. **Reject with Reason** — Reject and auto-refund to agent wallet
6. **Bulk Processing** — Handle multiple requests efficiently

### Payout Processing Flow

```
Admin opens Payout Management page
        │
        ▼
GET /api/admin/payout-requests
(Returns all pending requests)
        │
        ▼
Admin reviews each request:
  - Agent details (name, distributor ID)
  - KYC status (must be Approved)
  - Bank details (account, IFSC)
  - Requested amount
        │
        ▼
Admin clicks "Approve" or "Reject"
        │
        ├── Approve:
        │   POST /api/admin/payout/process
        │   → Razorpay payout initiated
        │   → Agent's pendingPayout decremented
        │   → Agent's totalWithdrawn incremented
        │   → Transaction record created
        │
        └── Reject:
            POST /api/admin/payout/process (with rejection)
            → Amount refunded to agent's walletBalance
            → Agent's pendingPayout decremented
            → Transaction record created
```

### Franchise Payout Management

The admin also manages franchise monthly payouts from the franchise financial management page:

- `GET /api/admin/financials/monthly-payout-requests` — View all franchise payout requests
- `PATCH /api/admin/financials/monthly-payout-request/:requestId` — Approve/Reject

---

## Franchise Management Module

The admin has a dedicated sub-module for franchise management with 4 main pages:

### 1. Franchise Dashboard (`/admin/franchiseManageDashboard`)

Overview of the franchise network:
- Total franchises by tier (Village, City, District, State)
- Active vs Pending vs Blocked counts
- Revenue from franchise operations
- Network growth charts

**API**: `GET /api/admin/dashboard/overview`

### 2. KYC Verification (`/admin/FranchiseVerifyKyc`)

Review and approve franchise applications:
- List of pending applications with all submitted documents
- Preview KYC images (PAN Card, Aadhaar)
- View business documents (Udyam, Shop License)
- Approve or Reject with comments
- View franchise hierarchy placement

**APIs**:
- `GET /api/admin/applications/pending`
- `PATCH /api/admin/applications/:franchiseId/review`
- `GET /api/admin/franchises/hierarchy`
- `PATCH /api/admin/franchises/:franchiseId/status`

### 3. Supply Management (`/admin/manageFranchiseSupply`)

Manage supply requests from franchises:
- View all supply requests with status
- Filter by status, franchise type, region
- Dispatch products directly to franchises
- Track dispatch and delivery status
- Create direct supply dispatches

**APIs**:
- `GET /api/admin/supplies`
- `POST /api/admin/supplies/send`
- `PATCH /api/admin/supplies/:requestId/status`

### 4. Financial Management (`/admin/manageFranchiseFinancials`)

Handle franchise financial operations:
- Financial summary across all franchises
- Process settlements (ROI, Rent, Commission credits)
- Review withdrawal requests
- View individual franchise ledgers
- Monthly payout request processing

**APIs**:
- `GET /api/admin/financials/summary`
- `POST /api/admin/financials/settle`
- `PATCH /api/admin/financials/withdrawal/:requestId`
- `GET /api/admin/financials/ledger/:franchiseId`
- `GET /api/admin/financials/monthly-payout-requests`
- `PATCH /api/admin/financials/monthly-payout-request/:requestId`

---

## Admin Authentication

### Admin Account Creation

Admin accounts are created using the **seed script** (`backend/seed.admin.js`):

```bash
node seed.admin.js
```

This creates an admin account with predefined credentials stored in a separate `Admin` model.

### Admin Login

- Admin logs in through the **same login form** as agents.
- The backend checks the `Admin` collection **first** during login.
- Upon successful login, the JWT token contains `role: "Admin"`.
- Frontend routes the admin to `/admin/dashboard`.

### Admin Model

The admin has a separate model (`backend/models/admin.model.js`) with:
- Email, password (hashed), role, profile details
- Separate from the User model for security isolation

---

## Admin Routes & Access Control

### Route Protection

All admin routes are protected by:

1. **Authentication Middleware** — Verifies JWT token
2. **Role Check** — The `Protected` component on the frontend checks for `role === "Admin"`
3. **Backend Middleware** — `authenticateUser` middleware resolves the role from JWT

### Frontend Route Configuration

```jsx
{
  path: "admin",
  element: (
    <Protected allowedRoles={["Admin"]}>
      <Outlet />
    </Protected>
  ),
  children: [
    { path: "dashboard", element: <AdminDashboard /> },
    { path: "agentList", element: <AgentListPage /> },
    { path: "agentDetails", element: <AgentDetailPage /> },
    { path: "createProduct", element: <CreateProductPage /> },
    { path: "inventory", element: <InventoryManager /> },
    { path: "franchiseManageDashboard", element: <MangeFranchiseDashboard /> },
    { path: "FranchiseVerifyKyc", element: <FranchiseGovernanceUI /> },
    { path: "manageFranchiseSupply", element: <ManageFranchiseSupplyUI /> },
    { path: "manageFranchiseFinancials", element: <ManageFranchiseFinancials /> },
    { path: "agentPayout", element: <AdminPayout /> }
  ]
}
```

### Backend Route Configuration

All admin routes are under `/api/admin` and use the `authenticateUser` middleware:

```javascript
router.use(authenticateUser);  // Applied to all admin routes
```

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/controllers/admin.controller.js` | Admin dashboard, agent management, inventory |
| `backend/controllers/payoutRequest.controller.js` | Payout request handling |
| `backend/controllers/product.controller.js` | Product creation |
| `backend/controllers/franchiseMangment/franchiseMangeDashboard.controller.js` | Franchise dashboard |
| `backend/controllers/franchiseMangment/franchiseMangement.controller.js` | Franchise KYC/status |
| `backend/controllers/franchiseMangment/adminSupply.Controller.js` | Supply management |
| `backend/controllers/franchiseMangment/adminFinaclials.controller.js` | Financial management |
| `backend/routes/admin.Routes.js` | All admin route definitions |
| `backend/models/admin.model.js` | Admin schema |
| `backend/seed.admin.js` | Admin account seeder |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/admin/pages/Dashboard.jsx` | Admin dashboard with analytics |
| `Frontend/src/features/admin/pages/AgentListPage.jsx` | Agent list with search/filter |
| `Frontend/src/features/admin/pages/AgentDetails.jsx` | Agent detail view |
| `Frontend/src/features/admin/pages/CreateProduct.jsx` | Product creation form |
| `Frontend/src/features/admin/pages/AdminPayout.jsx` | Payout management |
| `Frontend/src/features/admin/state/admin.slice.js` | Admin Redux slice |
| `Frontend/src/features/admin/state/product.slice.js` | Product Redux slice |
| `Frontend/src/features/admin/state/adminPayoutSlice.js` | Payout Redux slice |
| `Frontend/src/features/admin/franchiseMangement/pages/MangeFranchiseDashboard.jsx` | Franchise dashboard |
| `Frontend/src/features/admin/franchiseMangement/pages/FranchiseVerifyKyc.jsx` | KYC verification |
| `Frontend/src/features/admin/franchiseMangement/pages/ManageFranchiseSupplyUI.jsx` | Supply management |
| `Frontend/src/features/admin/franchiseMangement/pages/ManageFranchiseFinance.jsx` | Financial management |
| `Frontend/src/features/admin/franchiseMangement/state/` | Franchise management slices |
| `Frontend/src/features/inventory/pages/Inventory.jsx` | Inventory management UI |
