# 🏢 Shourya Enterprise — MLM & Franchise Management Platform

<div align="center">

**A full-stack Multi-Level Marketing (MLM) and Franchise Management web application built with React.js and Node.js**

🌐 Live Website: [shouryaevtech.com](https://shouryaevtech.com)

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Database Models](#-database-models)
- [Feature Documentation](#-feature-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Shourya Enterprise** is a comprehensive enterprise-grade platform that combines **Multi-Level Marketing (MLM)** with **Franchise Management**. The platform supports a complete binary tree network marketing system where agents can register, build their downline network, purchase products, earn commissions (direct bonus + matching bonus), and manage their wallets — all while a parallel franchise management system handles multi-tier franchise operations (Village, City, District, State) with KYC verification, supply chain management, inventory tracking, and automated financial settlements.

### What This Platform Does

1. **MLM Binary Tree Network** — Agents register under a sponsor, are placed in a binary tree (left/right), and earn commissions through direct referrals and binary matching.
2. **E-Commerce Product System** — Full product catalog with cart, checkout, and Razorpay payment integration.
3. **Franchise Management** — Multi-tier franchise system (Village → City → District → State) with hierarchical supply chain, KYC verification, and financial management.
4. **Admin Control Panel** — Complete admin dashboard for managing agents, franchises, products, inventory, payouts, and analytics.

---

## 🚀 Key Features

### For Agents (MLM Distributors)
- ✅ Agent Registration & Login with JWT authentication
- ✅ Binary Tree Network visualization (left/right placement)
- ✅ Agent Dashboard with earnings, BV points, and team stats
- ✅ Wallet system with withdrawal requests
- ✅ KYC submission (PAN Card & Aadhaar Card)
- ✅ Bank details management for payouts
- ✅ Product purchase with activation package system
- ✅ Direct Bonus & Binary Matching Bonus calculation
- ✅ Profile management with address details

### For Franchises
- ✅ Multi-tier franchise registration (Village/City/District/State)
- ✅ KYC document submission with business verification
- ✅ Franchise Dashboard with financial analytics
- ✅ Inventory management and direct sales
- ✅ Hierarchical supply request system
- ✅ Financial passbook with transaction history
- ✅ Monthly payout request system (ROI + Rent + Commission)
- ✅ Profile management with password change

### For Admin
- ✅ Comprehensive Admin Dashboard with analytics
- ✅ Agent management (list, details, activate/block)
- ✅ Franchise KYC verification and approval
- ✅ Product creation with Cloudinary image upload
- ✅ Inventory management (purchase/deduct stock)
- ✅ Supply chain management for franchise network
- ✅ Financial settlements and payout processing
- ✅ Franchise hierarchy visualization

### Platform-Wide
- ✅ Razorpay Payment Gateway integration
- ✅ Redis caching for high-performance API responses
- ✅ Cloudinary media storage for images
- ✅ Role-based access control (RBAC)
- ✅ Responsive UI with TailwindCSS
- ✅ Receipt generation after purchase
- ✅ Contact Us page
- ✅ Product slider and hero section on homepage

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library for building components |
| **Vite 8** | Lightning-fast build tool and dev server |
| **Redux Toolkit** | Global state management |
| **React Router v7** | Client-side routing with nested layouts |
| **Axios** | HTTP client for API communication |
| **TailwindCSS 4** | Utility-first CSS framework |
| **Recharts** | Data visualization & chart library |
| **Lucide React** | Modern icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | Server-side runtime & web framework |
| **MongoDB + Mongoose 9** | NoSQL database with ODM |
| **Redis (ioredis)** | In-memory caching for sessions & API responses |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Razorpay SDK** | Payment gateway integration |
| **Cloudinary** | Cloud-based image storage and management |
| **Multer** | File upload handling |
| **Helmet** | HTTP security headers |
| **Morgan** | HTTP request logging |
| **Express Validator** | Request body validation |
| **Cookie Parser** | Cookie-based token management |
| **Compression** | Response compression (gzip) |

---

## 🏗 Project Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CLIENT (React)                     │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐ │
│  │  Pages  │  │  Redux   │  │   API Service Layer  │ │
│  │  (JSX)  │◄─│  Store   │◄─│   (Axios + Hooks)   │ │
│  └─────────┘  └──────────┘  └──────────┬──────────┘ │
└────────────────────────────────────────┬─────────────┘
                                         │ HTTP (REST API)
┌────────────────────────────────────────┼─────────────┐
│                  SERVER (Express)       │             │
│  ┌──────────┐  ┌──────────┐  ┌────────▼──────────┐  │
│  │  Routes  │──│Middleware│──│   Controllers     │  │
│  │          │  │ (Auth +  │  │  (Business Logic) │  │
│  │          │  │  RBAC)   │  │                   │  │
│  └──────────┘  └──────────┘  └────────┬──────────┘  │
│                                        │             │
│  ┌──────────┐  ┌──────────┐  ┌────────▼──────────┐  │
│  │  Redis   │  │Cloudinary│  │   Mongoose Models │  │
│  │  Cache   │  │ Storage  │  │   (MongoDB)       │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## 📂 Folder Structure

```
shourya_enterprise/
│
├── Frontend/                          # React Frontend Application
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── App/
│   │   │   ├── App.jsx                # Root component
│   │   │   ├── App.routes.jsx         # All application routes
│   │   │   ├── app.store.js           # Redux store configuration
│   │   │   └── App.css                # Global styles
│   │   │
│   │   ├── components/                # Shared/common components
│   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   ├── Footer.jsx             # Footer section
│   │   │   ├── Hero.jsx               # Homepage hero section
│   │   │   ├── Home.jsx               # Homepage container
│   │   │   ├── ProductSlider.jsx      # Product carousel slider
│   │   │   ├── ContactUs.jsx          # Contact page
│   │   │   ├── Protected.jsx          # Route protection component
│   │   │   └── ReceiptPage.jsx        # Order receipt display
│   │   │
│   │   ├── features/                  # Feature-based modules
│   │   │   ├── auth/                  # Authentication (Login/Register)
│   │   │   │   ├── pages/
│   │   │   │   ├── hook/
│   │   │   │   ├── service/
│   │   │   │   └── state/             # Auth Redux slice
│   │   │   │
│   │   │   ├── agent/                 # Agent/Distributor feature
│   │   │   │   ├── pages/             # Dashboard, Profile, Wallet, Network
│   │   │   │   ├── hook/
│   │   │   │   ├── service/
│   │   │   │   └── state/             # Agent Redux slices
│   │   │   │
│   │   │   ├── admin/                 # Admin panel feature
│   │   │   │   ├── pages/             # Dashboard, AgentList, CreateProduct
│   │   │   │   ├── franchiseMangement/ # Franchise management sub-module
│   │   │   │   │   ├── pages/         # KYC, Supply, Finance dashboards
│   │   │   │   │   ├── hook/
│   │   │   │   │   ├── service/
│   │   │   │   │   └── state/
│   │   │   │   ├── hook/
│   │   │   │   ├── service/
│   │   │   │   └── state/
│   │   │   │
│   │   │   ├── franchise/             # Franchise user feature
│   │   │   │   ├── pages/             # Dashboard, Inventory, Supply, Finance
│   │   │   │   ├── hooks/
│   │   │   │   ├── service/
│   │   │   │   └── state/
│   │   │   │
│   │   │   ├── products/              # Product browsing
│   │   │   ├── cart/                   # Shopping cart
│   │   │   ├── Payment/               # Razorpay payment
│   │   │   └── inventory/             # Inventory management
│   │   │
│   │   ├── assets/                    # Images and static assets
│   │   └── main.jsx                   # App entry point
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Node.js Backend Application
│   ├── config/
│   │   ├── config.js                  # Environment config & Cloudinary setup
│   │   ├── db.js                      # MongoDB connection
│   │   └── cacheRedis.js              # Redis client & cache middleware
│   │
│   ├── controllers/
│   │   ├── auth.controller.js         # Register, Login, Logout
│   │   ├── agent.controller.js        # Agent dashboard, wallet, cart, profile
│   │   ├── admin.controller.js        # Admin operations, agent mgmt, inventory
│   │   ├── franchise.controller.js    # Franchise operations, supply, finance
│   │   ├── payment.controller.js      # Razorpay orders, MLM distribution
│   │   ├── product.controller.js      # Product CRUD, image upload
│   │   ├── payoutRequest.controller.js# Monthly payout requests
│   │   └── franchiseMangment/         # Admin-side franchise management
│   │       ├── franchiseMangeDashboard.controller.js
│   │       ├── franchiseMangement.controller.js
│   │       ├── adminSupply.Controller.js
│   │       └── adminFinaclials.controller.js
│   │
│   ├── models/
│   │   ├── user.models.js             # Agent/User schema (binary tree)
│   │   ├── admin.model.js             # Admin schema
│   │   ├── franchise.model.js         # Franchise schema (multi-tier)
│   │   ├── product.model.js           # Product schema (MLM pricing)
│   │   ├── order.model.js             # Order schema
│   │   ├── cart.model.js              # Cart schema
│   │   ├── inventry.model.js          # Inventory schema
│   │   ├── franchiseInventory.model.js# Franchise inventory
│   │   ├── supplyRequest.model.js     # Supply request schema
│   │   ├── walletTransactionModel.js  # Wallet transaction ledger
│   │   ├── agentTransaction.model.js  # Agent transaction records
│   │   ├── financialPayout.model.js   # Financial payout records
│   │   ├── payoutRequest.model.js     # Monthly payout requests
│   │   ├── withdrawalModel.js         # Withdrawal records
│   │   └── withdrawalRequest.model.js # Withdrawal request schema
│   │
│   ├── middlewares/
│   │   └── agent.middleware.js        # JWT auth + Redis session caching
│   │
│   ├── routes/
│   │   ├── auth.routes.js             # /api/auth
│   │   ├── agentDashboard.routes.js   # /api/agent
│   │   ├── admin.Routes.js            # /api/admin
│   │   ├── product.routes.js          # /api/home
│   │   ├── payment.routes.js          # /api/payment
│   │   └── franchise.Routes.js        # /api/franchise
│   │
│   ├── services/
│   │   └── storage.service.js         # Cloudinary upload service
│   │
│   ├── utils/
│   │   └── razorpayPayoutHelper.js    # Razorpay payout utility
│   │
│   ├── validators/
│   │   └── auth.validator.js          # Input validation rules
│   │
│   ├── dao/                           # Data Access Objects
│   ├── src/
│   │   └── app.js                     # Express app configuration
│   │
│   ├── server.js                      # Server entry point (port 3000)
│   ├── seed.admin.js                  # Admin seeder script
│   ├── seed.user.js                   # User/agent seeder script
│   ├── products.seed.js               # Product seeder script
│   └── package.json
│
├── docs/                              # 📚 Feature Documentation
│   ├── AUTHENTICATION.md
│   ├── AGENT_MANAGEMENT.md
│   ├── MLM_BINARY_TREE.md
│   ├── FRANCHISE_MANAGEMENT.md
│   ├── PRODUCT_MANAGEMENT.md
│   ├── PAYMENT_SYSTEM.md
│   ├── INVENTORY_MANAGEMENT.md
│   ├── WALLET_AND_PAYOUT.md
│   └── ADMIN_PANEL.md
│
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org)
- **MongoDB** (Atlas or local) — [Setup Guide](https://www.mongodb.com/docs/manual/installation/)
- **Redis** (Cloud or local) — [Redis Cloud](https://redis.io/try-free/)
- **Razorpay Account** — [Dashboard](https://dashboard.razorpay.com)
- **Cloudinary Account** — [Dashboard](https://cloudinary.com/console)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/YashNagvePatil/-shourya_enterprise.git
cd shourya_enterprise
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

#### 4. Configure Environment Variables

Create `.env` files in both `backend/` and `Frontend/` directories. See the [Environment Variables](#-environment-variables) section below.

#### 5. Seed the Database (Optional)

```bash
cd backend
node seed.admin.js      # Create admin account
node seed.user.js        # Create sample agents
node products.seed.js    # Create sample products
```

#### 6. Start the Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server starts on http://localhost:3000
```

**Frontend** (Terminal 2):
```bash
cd Frontend
npm run dev
# App opens at http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shourya_enterprise

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary (Image Storage)
CLOUDYNARY_CLOUD_NAME=your_cloud_name
CLOUDYNARY_API_KEY=your_api_key
CLOUDYNARY_API_SECRET=your_api_secret

# Razorpay (Payment Gateway)
RAZORPAY_TEST_API_KEY=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAYX_ACCOUNT_NUMBER=your_razorpayx_account_number

# Redis (Caching)
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

### Frontend (`Frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new agent |
| `POST` | `/api/auth/login` | Login (Agent/Admin) |
| `POST` | `/api/auth/logout` | Logout and clear session |

### Agent Dashboard (`/api/agent`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/agent/dashBoard` | Get agent dashboard data |
| `GET` | `/api/agent/networkTree` | Get binary tree network |
| `GET` | `/api/agent/wallet` | Get wallet & earnings details |
| `POST` | `/api/agent/wallet/withdrawalRequests` | Request payout withdrawal |
| `GET` | `/api/agent/getCart` | Get shopping cart |
| `POST` | `/api/agent/addCart` | Add item to cart |
| `DELETE` | `/api/agent/:productId` | Remove item from cart |
| `GET` | `/api/agent/profile` | Get agent profile |
| `PUT` | `/api/agent/profile/update` | Update profile info |
| `POST` | `/api/agent/profile/kyc` | Submit KYC documents |
| `PUT` | `/api/agent/profile/bank-details` | Update bank details |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin analytics dashboard |
| `GET` | `/api/admin/agent/management` | List all agents |
| `GET` | `/api/admin/agent/:id` | Get specific agent details |
| `PATCH` | `/api/admin/agent/status/:id` | Activate/Block agent |
| `POST` | `/api/admin/payout/process` | Process agent payout |
| `GET` | `/api/admin/payout-requests` | Get all payout requests |
| `POST` | `/api/admin/createProduct` | Create a new product |
| `POST` | `/api/admin/inventory/purchase` | Purchase inventory stock |
| `POST` | `/api/admin/inventory/deduct` | Deduct inventory stock |
| `GET` | `/api/admin/inventory/list` | List all inventory items |
| `GET` | `/api/admin/inventory/:itemId` | Get inventory item details |

### Admin — Franchise Management (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard/overview` | Franchise dashboard overview |
| `GET` | `/api/admin/dashboard/analytics` | Network analytics |
| `GET` | `/api/admin/applications/pending` | Pending franchise applications |
| `PATCH` | `/api/admin/applications/:franchiseId/review` | Approve/Reject franchise |
| `GET` | `/api/admin/franchises/hierarchy` | Franchise hierarchy tree |
| `PATCH` | `/api/admin/franchises/:franchiseId/status` | Update franchise status |
| `GET` | `/api/admin/supplies` | All supply requests |
| `POST` | `/api/admin/supplies/send` | Direct supply dispatch |
| `PATCH` | `/api/admin/supplies/:requestId/status` | Update supply status |
| `GET` | `/api/admin/financials/summary` | Financial summary |
| `POST` | `/api/admin/financials/settle` | Process settlement |
| `PATCH` | `/api/admin/financials/withdrawal/:requestId` | Review withdrawal |
| `GET` | `/api/admin/financials/ledger/:franchiseId` | Franchise ledger |

### Products (`/api/home`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/home` | Get all products (cached 5 min) |
| `GET` | `/api/home/:id` | Get product details (cached 5 min) |

### Payment (`/api/payment`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payment/create-order` | Create Razorpay order |
| `POST` | `/api/payment/verify-and-distribute` | Verify payment & distribute MLM |
| `GET` | `/api/payment/order/:orderId` | Get order receipt details |

### Franchise (`/api/franchise`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/franchise/register` | Register new franchise |
| `POST` | `/api/franchise/login` | Franchise login |
| `GET` | `/api/franchise/profile` | Get franchise profile |
| `PUT` | `/api/franchise/profile/update` | Update profile |
| `PUT` | `/api/franchise/profile/change-password` | Change password |
| `GET` | `/api/franchise/analytics` | Dashboard analytics |
| `GET` | `/api/franchise/financials` | Financial overview |
| `GET` | `/api/franchise/inventory` | View inventory |
| `POST` | `/api/franchise/inventory/sell` | Sell from inventory |
| `POST` | `/api/franchise/create-supply-request` | Create supply request |
| `GET` | `/api/franchise/get-supply-requests` | View supply requests |
| `PATCH` | `/api/franchise/supplies/:requestId/received` | Confirm supply received |
| `PATCH` | `/api/franchise/supplies/:requestId/fulfill` | Fulfill subordinate supply |
| `GET` | `/api/franchise/financials/overview` | Detailed financial overview |
| `GET` | `/api/franchise/financials/passbook` | Transaction passbook |
| `GET` | `/api/franchise/financials/analytics` | Financial analytics |
| `POST` | `/api/franchise/financials/withdraw` | Request withdrawal |
| `POST` | `/api/franchise/financials/withdraw/cancel` | Cancel withdrawal |
| `GET` | `/api/franchise/financials/payout-calculation` | Monthly payout calculation |
| `POST` | `/api/franchise/financials/payout-request` | Submit payout request |
| `GET` | `/api/franchise/financials/payout-requests` | View payout requests |

---

## 👥 User Roles

### 1. Agent (MLM Distributor)
- Registers with a sponsor/parent agent ID
- Placed in a **binary tree** (left or right position)
- Earns **Direct Bonus** for every direct referral who purchases
- Earns **Matching Bonus** based on BV (Business Volume) in weaker leg
- Can purchase activation packages to activate their ID
- Manages wallet, bank details, and KYC documents

### 2. Franchise Owner
- Registers as one of 4 tiers: **Village**, **City**, **District**, or **State**
- Each tier has different pricing, ROI, rent, and commission rates
- Submits KYC documents for admin verification
- Manages own inventory and can sell products directly
- Can request supplies from higher-tier franchises or admin
- Earns monthly ROI, rent allowance, and sales commission

### 3. Admin (Super Administrator)
- Has full control over the platform
- Manages all agents and franchises
- Creates products and manages inventory
- Verifies KYC applications
- Processes payouts and financial settlements
- Views comprehensive analytics and reports

---

## 🗄 Database Models

| Model | Description |
|---|---|
| `User` | Agent/Distributor with binary tree structure, BV points, wallet |
| `Admin` | Administrator account |
| `Franchise` | Multi-tier franchise with financial wallet |
| `Product` | Products with MLM pricing (MRP, DP, BV, PV) |
| `Order` | Purchase orders with Razorpay payment details |
| `Cart` | Shopping cart items |
| `Inventory` | Admin-level stock management |
| `FranchiseInventory` | Franchise-level stock tracking |
| `SupplyRequest` | Hierarchical supply chain requests |
| `WalletTransaction` | Franchise financial transaction ledger |
| `AgentTransaction` | Agent earning/deduction records |
| `PayoutRequest` | Monthly franchise payout requests |
| `WithdrawalRequest` | Agent withdrawal requests |
| `FinancialPayout` | Processed payout records |

---

## 📚 Feature Documentation

Detailed documentation for each feature is available in the `docs/` directory:

| Document | Description |
|---|---|
| [AUTHENTICATION.md](docs/AUTHENTICATION.md) | User registration, login, JWT tokens, session management |
| [AGENT_MANAGEMENT.md](docs/AGENT_MANAGEMENT.md) | Agent dashboard, profile, KYC, bank details |
| [MLM_BINARY_TREE.md](docs/MLM_BINARY_TREE.md) | Binary tree structure, BV calculation, bonus distribution |
| [FRANCHISE_MANAGEMENT.md](docs/FRANCHISE_MANAGEMENT.md) | Multi-tier franchises, registration, KYC, hierarchy |
| [PRODUCT_MANAGEMENT.md](docs/PRODUCT_MANAGEMENT.md) | Product CRUD, categories, MLM pricing, image upload |
| [PAYMENT_SYSTEM.md](docs/PAYMENT_SYSTEM.md) | Razorpay integration, order flow, MLM point distribution |
| [INVENTORY_MANAGEMENT.md](docs/INVENTORY_MANAGEMENT.md) | Admin & franchise inventory, supply chain |
| [WALLET_AND_PAYOUT.md](docs/WALLET_AND_PAYOUT.md) | Wallet system, withdrawals, payout processing |
| [ADMIN_PANEL.md](docs/ADMIN_PANEL.md) | Admin dashboard, analytics, management tools |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "Add: your feature description"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing **feature-based folder structure** (`pages/`, `hook/`, `service/`, `state/`)
- Use **Redux Toolkit** for state management
- Write meaningful commit messages
- Test all API endpoints before submitting PRs
- Use **express-validator** for input validation on new routes

---

## 📄 License

This project is proprietary software owned by **Shourya Enterprise**. All rights reserved.

---

<div align="center">

**Built with ❤️ by the Shourya Enterprise Development Team**

</div>
