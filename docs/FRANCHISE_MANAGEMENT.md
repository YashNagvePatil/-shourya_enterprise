# 🏪 Franchise Management System

## Overview

The Shourya Enterprise Franchise Management System supports a **multi-tier franchise hierarchy** with four levels: **Village**, **City**, **District**, and **State**. Each tier has unique pricing, ROI (Return on Investment), rent allowances, and commission structures. The system handles franchise registration, KYC verification, supply chain management, inventory tracking, financial transactions, and monthly payouts.

---

## Table of Contents

- [Franchise Tiers](#franchise-tiers)
- [Franchise Registration](#franchise-registration)
- [KYC Verification Process](#kyc-verification-process)
- [Franchise Dashboard](#franchise-dashboard)
- [Franchise Hierarchy](#franchise-hierarchy)
- [Supply Chain System](#supply-chain-system)
- [Franchise Inventory](#franchise-inventory)
- [Financial Management](#financial-management)
- [Monthly Payout System](#monthly-payout-system)
- [Profile Management](#profile-management)
- [Admin Franchise Management](#admin-franchise-management)
- [File References](#file-references)

---

## Franchise Tiers

The platform supports four franchise tiers, each with different investment levels and earning structures:

| Tier | Investment (₹) | Monthly ROI (₹) | Monthly Rent (₹) | Commission/Product (₹) | Commission (%) |
|---|---|---|---|---|---|
| **VILLAGE** | 1,50,000 | 5,000 | 0 | 500 | 0% |
| **CITY** | 4,00,000 | 50,000 | 30,000 | 0 | 1.5% |
| **DISTRICT** | 7,50,000 | 22,000 | 10,000 | 500 | 2% |
| **STATE** | 1,50,00,000 | 4,50,000 | 50,000 | 0 | 1.5% |

### Commission Types

- **Per-Product Commission (`commPerProduct`)** — Fixed amount earned per product sold (Village, District).
- **Percentage Commission (`commPercent`)** — Percentage of sales from under-franchises (City, State).

---

## Franchise Registration

### Registration Flow

1. **Franchise owner fills** the comprehensive registration form.
2. **Required information**:
   - Personal: Full Name, Email, Mobile, Password
   - Franchise Type: VILLAGE / CITY / DISTRICT / STATE
   - Address: State, District, City, Taluka, Village
   - Business Docs: Udyam Number, Firm Documents URL, Shop License URL
   - KYC: PAN Number + Image, Aadhaar Number + Image
   - Bank: Account Holder, Bank Name, Account Number, IFSC Code
3. **Documents are uploaded** to Cloudinary.
4. **Franchise record is created** with status `Pending`.
5. **Admin receives notification** to review the application.

### Registration Form Sections

```
Section 1: Personal Details
  → Full Name, Email, Mobile, Password

Section 2: Franchise Type Selection
  → VILLAGE / CITY / DISTRICT / STATE

Section 3: Location Details
  → State, District, City, Taluka, Village

Section 4: Business Documents
  → Udyam Number, Firm Documents, Shop License

Section 5: KYC Documents
  → PAN Card (Number + Image), Aadhaar Card (Number + Image)

Section 6: Bank Details
  → Account Holder, Bank Name, Account Number, IFSC
```

---

## KYC Verification Process

### Admin Review Flow

```
Franchise Registers → Status: "Pending"
       │
       ▼
Admin views pending applications
(GET /api/admin/applications/pending)
       │
       ▼
Admin reviews documents
       │
       ├── Approve → Status: "Active" ✅
       │             Franchise can now operate
       │
       └── Reject → Status: "Rejected" ❌
                    Franchise can re-apply
```

### Admin KYC Review Features

1. **View pending applications** with all submitted documents.
2. **Download/preview** uploaded KYC images (PAN Card, Aadhaar).
3. **Verify business documents** (Udyam, Shop License).
4. **Approve or Reject** with notes/comments.
5. **View franchise hierarchy** to understand placement.

### Status Values

| Status | Description |
|---|---|
| `Pending` | Application submitted, awaiting admin review |
| `Active` | Approved and fully operational |
| `Blocked` | Temporarily suspended by admin |
| `Rejected` | Application rejected by admin |

---

## Franchise Dashboard

The Franchise Dashboard provides a comprehensive overview of the franchise's business metrics.

### Dashboard Sections

1. **Financial Summary** — Wallet balance, total earnings, pending ROI, pending rent, total commission.
2. **Inventory Overview** — Current stock levels, low-stock alerts.
3. **Supply Request Status** — Pending, dispatched, and received supply orders.
4. **Sales Analytics** — Revenue charts using Recharts.
5. **Recent Transactions** — Latest financial transactions.

### API: `GET /api/franchise/analytics`

Returns analytics data including sales trends, revenue breakdown, and inventory health.

---

## Franchise Hierarchy

Franchises are organized in a **hierarchical structure** that mirrors geographic coverage:

```
                  [STATE Franchise]
                 /        |        \
    [DISTRICT 1]   [DISTRICT 2]   [DISTRICT 3]
     /       \          |
 [CITY 1]  [CITY 2]  [CITY 3]
  /    \
[VILLAGE 1] [VILLAGE 2]
```

### Hierarchy Rules

- A **Village** franchise operates under a City or District.
- A **City** franchise operates under a District.
- A **District** franchise operates under a State.
- A **State** franchise reports directly to the Admin.
- The `parentFranchiseId` field in the Franchise model links to the parent franchise.

### Supply Chain Flow

Supplies flow **downward** through the hierarchy:

```
Admin → State → District → City → Village
```

---

## Supply Chain System

### How Supply Requests Work

1. **Village/City franchise** creates a supply request for products.
2. The request is **visible to higher-tier franchises** and admin based on the `visibleTo` flags.
3. **Higher-tier franchise or Admin** can fulfill the request by dispatching products.
4. **Requesting franchise** confirms receipt of goods.

### Supply Request Flow

```
Village creates supply request
(POST /api/franchise/create-supply-request)
        │
        ▼
Request visible to City/District/State/Admin
(based on visibleTo flags)
        │
        ▼
Admin or Higher Franchise dispatches
(PATCH /api/admin/supplies/:requestId/status)
        │
        ▼
Status: "Dispatched"
        │
        ▼
Franchise confirms receipt
(PATCH /api/franchise/supplies/:requestId/received)
        │
        ▼
Status: "Received" → Inventory Updated
```

### Supply Request Status Values

| Status | Description |
|---|---|
| `Pending` | Request submitted, waiting for dispatch |
| `Dispatched` | Products shipped by admin or higher franchise |
| `Received` | Franchise confirmed receipt of goods |
| `Fulfilled` | Order fully completed |
| `Rejected` | Request rejected by admin |
| `Cancelled` | Request cancelled by franchise |

### Supply Request Data Model

```javascript
{
  requestNumber: "SR-2026-001",
  requesterFranchise: ObjectId,          // Who is requesting
  requesterType: "VILLAGE",              // Tier of requester
  requesterLocation: { state, district, city, village },
  items: [
    { productId, quantity, unitPrice, subtotal }
  ],
  totalAmount: 25000,
  visibleTo: {
    city: true, district: true, state: true, admin: true
  },
  status: "Pending",
  fulfilledBy: "ADMIN" | "DISTRICT" | "STATE" | "CITY",
  fulfilledByFranchise: ObjectId
}
```

---

## Franchise Inventory

Each franchise maintains its own inventory separate from the admin's central inventory.

### Inventory Operations

| Action | API | Description |
|---|---|---|
| View Inventory | `GET /api/franchise/inventory` | List all products in stock |
| Sell from Inventory | `POST /api/franchise/inventory/sell` | Deduct stock when selling directly |
| Receive Supply | Via supply request | Stock increases when supply is received |

### Inventory Model

```javascript
{
  franchiseId: ObjectId,
  productId: ObjectId,
  quantity: Number,      // Current stock
  lastUpdated: Date
}
```

---

## Financial Management

### Franchise Wallet

Each franchise has a wallet with the following fields:

| Field | Description |
|---|---|
| `balance` | Current withdrawable balance |
| `totalEarnings` | Lifetime total earnings |
| `pendingRent` | Accumulated unpaid rent allowance |
| `pendingRoi` | Accumulated unpaid ROI |
| `totalCommission` | Lifetime commission earned |

### Earnings Sources

1. **ROI (Return on Investment)** — Monthly fixed amount based on franchise tier.
2. **Rent Allowance** — Monthly rent support (varies by tier).
3. **Commission** — Earned on product sales or sub-franchise sales.

### Financial APIs

| API | Method | Description |
|---|---|---|
| `/api/franchise/financials/overview` | `GET` | Financial overview with breakdown |
| `/api/franchise/financials/passbook` | `GET` | Full transaction history (passbook) |
| `/api/franchise/financials/analytics` | `GET` | Financial analytics & trends |
| `/api/franchise/financials/withdraw` | `POST` | Request a withdrawal |
| `/api/franchise/financials/withdraw/cancel` | `POST` | Cancel pending withdrawal |

### Wallet Transaction Types

| Type | Category | Description |
|---|---|---|
| `RENT` | INCOME | Monthly rent allowance credit |
| `ROI` | INCOME | Monthly ROI credit |
| `COMMISSION` | INCOME | Sales commission credit |
| `CREDIT` | INCOME | Manual credit by admin |
| `WITHDRAWAL_REQUEST` | PAYOUT | Withdrawal initiated |
| `WITHDRAWAL_APPROVED` | PAYOUT | Withdrawal processed |
| `WITHDRAWAL_REFUND` | INCOME | Rejected withdrawal refunded |
| `SETTLEMENT` | PAYOUT | Admin settlement payout |
| `SUPPLY_PURCHASE` | EXPENSE | Stock purchase debit |
| `PENALTY` | PAYOUT | Admin-imposed penalty |
| `ADJUSTMENT` | PAYOUT | Manual adjustment |

---

## Monthly Payout System

Franchise owners can request monthly payouts that include their accumulated ROI, rent, and commission.

### Payout Calculation

```
Monthly Payout = ROI Amount + Rent Amount + Commission Amount
```

| Franchise Type | ROI | Rent | Commission |
|---|---|---|---|
| VILLAGE | ₹5,000 | ₹0 | ₹500 × products sold |
| CITY | ₹50,000 | ₹30,000 | 1.5% of sub-franchise sales |
| DISTRICT | ₹22,000 | ₹10,000 | ₹500 per product + 2% of sales |
| STATE | ₹4,50,000 | ₹50,000 | 1.5% of sub-franchise sales |

### Payout Request Flow

```
Franchise calculates monthly payout
(GET /api/franchise/financials/payout-calculation)
        │
        ▼
Franchise submits payout request
(POST /api/franchise/financials/payout-request)
        │
        ▼
Admin reviews payout request
(GET /api/admin/financials/monthly-payout-requests)
        │
        ▼
Admin approves or rejects
(PATCH /api/admin/financials/monthly-payout-request/:requestId)
        │
        ├── Approved → Amount credited to wallet ✅
        └── Rejected → Reason provided ❌
```

### Payout Request Constraints

- **One request per franchise per month** (unique constraint on `franchiseId + month + year`).
- Typically processed on the **5th of each month**.
- Bank details snapshot is saved with each request for audit purposes.

---

## Profile Management

### Features

1. **View Profile** — All personal, business, and bank information.
2. **Update Profile** — Edit personal details and address.
3. **Change Password** — Secure password change with old password verification.

### APIs

| API | Method | Description |
|---|---|---|
| `/api/franchise/profile` | `GET` | Get full profile |
| `/api/franchise/profile/update` | `PUT` | Update personal info |
| `/api/franchise/profile/change-password` | `PUT` | Change password |

---

## Admin Franchise Management

The admin has a dedicated sub-module for managing all franchise operations.

### Admin Franchise Pages

1. **Franchise Dashboard** — Overview of all franchises, revenue, and network health.
2. **KYC Verification** — Review and approve/reject franchise applications.
3. **Supply Management** — View and fulfill supply requests from franchises.
4. **Financial Management** — Settlements, withdrawal reviews, ledger viewing.

### Admin Franchise APIs

See the [API Endpoints section in README](../README.md#api-endpoints) for the complete list.

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/models/franchise.model.js` | Franchise schema with tier definitions |
| `backend/models/supplyRequest.model.js` | Supply request schema |
| `backend/models/franchiseInventory.model.js` | Franchise inventory schema |
| `backend/models/walletTransactionModel.js` | Wallet transaction ledger |
| `backend/models/payoutRequest.model.js` | Monthly payout request schema |
| `backend/models/withdrawalRequest.model.js` | Withdrawal request schema |
| `backend/controllers/franchise.controller.js` | All franchise operations |
| `backend/controllers/payoutRequest.controller.js` | Payout request processing |
| `backend/controllers/franchiseMangment/` | Admin-side franchise controllers |
| `backend/routes/franchise.Routes.js` | Franchise route definitions |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/franchise/pages/FranchiseRegister.jsx` | Registration form |
| `Frontend/src/features/franchise/pages/franchiseLogin.jsx` | Login page |
| `Frontend/src/features/franchise/pages/FranchiseDashboard.jsx` | Dashboard |
| `Frontend/src/features/franchise/pages/Inventory.jsx` | Inventory management |
| `Frontend/src/features/franchise/pages/Supplyrequest.jsx` | Supply request UI |
| `Frontend/src/features/franchise/pages/FranchiseFinance.jsx` | Financial overview |
| `Frontend/src/features/franchise/pages/FranchisePayoutRequest.jsx` | Monthly payout |
| `Frontend/src/features/franchise/pages/FranchiseProfile.jsx` | Profile management |
| `Frontend/src/features/admin/franchiseMangement/` | Admin franchise module |
