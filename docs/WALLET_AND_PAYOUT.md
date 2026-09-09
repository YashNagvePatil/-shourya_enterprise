# 💰 Wallet & Payout System

## Overview

The Shourya Enterprise Wallet & Payout System manages all financial transactions for both **Agents** and **Franchises**. Agents earn through Direct Bonuses and Binary Matching Bonuses, while Franchises earn through ROI, Rent Allowances, and Sales Commissions. Both can request withdrawals, which are processed by the admin. The system integrates with **Razorpay** for automated payouts using the Razorpay Fund Account and Payout APIs.

---

## Table of Contents

- [Agent Wallet System](#agent-wallet-system)
- [Franchise Wallet System](#franchise-wallet-system)
- [Withdrawal Request Flow](#withdrawal-request-flow)
- [Admin Payout Processing](#admin-payout-processing)
- [Razorpay Payout Integration](#razorpay-payout-integration)
- [Transaction Records](#transaction-records)
- [Monthly Payout System (Franchise)](#monthly-payout-system-franchise)
- [Financial Security](#financial-security)
- [File References](#file-references)

---

## Agent Wallet System

### Wallet Fields

Each agent has wallet-related fields directly in the User model:

| Field | Description |
|---|---|
| `walletBalance` | Current withdrawable balance (₹) |
| `totalDirectBonus` | Lifetime direct referral earnings |
| `totalMatchingBonus` | Lifetime binary matching earnings |
| `totalEarning` | Lifetime total earnings (all sources) |
| `totalWithdrawn` | Total amount already paid out |
| `pendingPayout` | Amount requested but not yet processed |

### How Agents Earn

```
┌─────────────────────────────────────────────────────┐
│              AGENT EARNING SOURCES                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. DIRECT BONUS                                     │
│     → Earned when a directly sponsored agent          │
│       purchases a product                             │
│     → Amount = product.directCommission               │
│     → Credited to: walletBalance + totalDirectBonus   │
│                                                      │
│  2. BINARY MATCHING BONUS                            │
│     → Earned when BV accumulates in both legs         │
│     → Amount = MIN(leftBV, rightBV) × percentage      │
│     → Credited to: walletBalance + totalMatchingBonus │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Agent Wallet Page (`/agent/wallet`)

Displays:
- 💰 Current wallet balance
- 📊 Earnings breakdown (Direct vs Matching)
- 📈 Earning trends chart (Recharts)
- 📝 Transaction history
- 🏧 Withdrawal request form
- 📋 Withdrawal request status tracking

---

## Franchise Wallet System

### Wallet Fields

Each franchise has an embedded `wallet` object:

```javascript
wallet: {
  balance: 0,           // Current withdrawable balance
  totalEarnings: 0,      // Lifetime total earnings
  pendingRent: 0,        // Accumulated unpaid rent
  pendingRoi: 0,         // Accumulated unpaid ROI
  totalCommission: 0     // Lifetime commission earned
}
```

### How Franchises Earn

```
┌─────────────────────────────────────────────────────┐
│            FRANCHISE EARNING SOURCES                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. ROI (Return on Investment)                       │
│     → Monthly fixed amount based on franchise tier   │
│     → Village: ₹5,000 | City: ₹50,000               │
│     → District: ₹22,000 | State: ₹4,50,000          │
│                                                      │
│  2. RENT ALLOWANCE                                   │
│     → Monthly rent support based on tier              │
│     → Village: ₹0 | City: ₹30,000                   │
│     → District: ₹10,000 | State: ₹50,000            │
│                                                      │
│  3. SALES COMMISSION                                 │
│     → Per-product: ₹500/product (Village, District)  │
│     → Percentage: 1.5-2% of sales (City, District,   │
│       State)                                         │
│                                                      │
│  4. SETTLEMENT CREDITS                               │
│     → Admin-initiated financial settlements           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Franchise Financial Pages

1. **Financial Overview** (`/franchise/finance`) — Wallet summary, earnings breakdown.
2. **Passbook** — Complete transaction history like a bank passbook.
3. **Analytics** — Financial trends, monthly comparisons.
4. **Payout Request** (`/franchise/payoutRequest`) — Monthly payout submission.

---

## Withdrawal Request Flow

### Agent Withdrawal

```
Agent clicks "Request Withdrawal" on Wallet page
        │
        ▼
Enter withdrawal amount
(Must be ≤ walletBalance)
        │
        ▼
POST /api/agent/wallet/withdrawalRequests
        │
        ▼
Backend validates:
  - Amount > 0
  - Amount ≤ walletBalance
  - KYC status is Approved
  - Bank details are filled
        │
        ▼
Deduct amount from walletBalance
Add to pendingPayout
Create withdrawal request record
        │
        ▼
Admin reviews the request
(GET /api/admin/payout-requests)
        │
        ▼
Admin processes payout
(POST /api/admin/payout/process)
        │
        ├── Approved → Process via Razorpay Payout
        │              Deduct from pendingPayout
        │              Add to totalWithdrawn
        │              Status: "Completed"
        │
        └── Rejected → Refund to walletBalance
                       Deduct from pendingPayout
                       Status: "Rejected"
```

### Franchise Withdrawal

```
Franchise clicks "Request Withdrawal" on Finance page
        │
        ▼
POST /api/franchise/financials/withdraw
(amount, bank details confirmation)
        │
        ▼
Backend validates:
  - Amount > 0
  - Amount ≤ wallet.balance
  - Status is "Active"
        │
        ▼
Deduct from wallet.balance
Create WalletTransaction (type: WITHDRAWAL_REQUEST)
Create WithdrawalRequest record
        │
        ▼
Admin reviews
(PATCH /api/admin/financials/withdrawal/:requestId)
        │
        ├── Approved → Process payment
        │              Create Transaction (WITHDRAWAL_APPROVED)
        │
        └── Rejected → Refund to wallet.balance
                       Create Transaction (WITHDRAWAL_REFUND)
```

### Cancel Withdrawal (Franchise)

Franchises can cancel pending withdrawal requests:

```
POST /api/franchise/financials/withdraw/cancel
  → Amount refunded to wallet.balance
  → Withdrawal request status set to "Cancelled"
  → WalletTransaction (WITHDRAWAL_REFUND) created
```

---

## Admin Payout Processing

### Agent Payout (Admin)

1. Admin navigates to `/admin/agentPayout`.
2. Views all pending payout requests.
3. Reviews agent details, KYC status, and bank information.
4. Approves or rejects each request.
5. For approved requests:
   - Razorpay Payout API is called.
   - Amount is transferred to the agent's bank account.
   - Transaction status is updated.

### Franchise Payout (Admin)

1. Admin navigates to the Franchise Financial Management page.
2. Views pending withdrawal requests.
3. Reviews franchise details and bank information.
4. Approves or rejects.

### Admin Payout Dashboard Features

- 📋 List of all pending payout requests
- 🔍 Filter by status (Pending/Approved/Rejected)
- 👤 View requester details (agent/franchise profile)
- 🏦 View bank details for verification
- ✅ Approve with single click
- ❌ Reject with reason
- 📊 Payout analytics and totals

---

## Razorpay Payout Integration

The platform uses **RazorpayX** for automated bank payouts.

### Payout Helper (`backend/utils/razorpayPayoutHelper.js`)

This utility handles:

1. **Creating a Fund Account** — Links the agent/franchise's bank details to Razorpay.
2. **Creating a Payout** — Initiates a bank transfer via Razorpay Payout API.
3. **Checking Payout Status** — Verifies if the payout was successful.

### Payout Flow

```
Admin approves withdrawal
        │
        ▼
Check if razorpayFundAccountId exists
        │
        ├── No → Create Fund Account via Razorpay API
        │        (Bank account details, IFSC, name)
        │        Save razorpayFundAccountId to user
        │
        └── Yes → Use existing Fund Account
        │
        ▼
Create Payout via Razorpay API
  - fund_account_id
  - amount (in paise)
  - currency: "INR"
  - mode: "IMPS" / "NEFT" / "UPI"
  - purpose: "payout"
        │
        ▼
Razorpay processes transfer
        │
        ▼
Update withdrawal request status to "Completed"
Update user's totalWithdrawn
```

### Required Configuration

```env
RAZORPAY_TEST_API_KEY=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAYX_ACCOUNT_NUMBER=your_account_number
```

---

## Transaction Records

### Agent Transactions (`agentTransaction.model.js`)

Records every financial event in an agent's account:

```javascript
{
  agentId: ObjectId,
  type: "DIRECT_BONUS" | "MATCHING_BONUS" | "WITHDRAWAL" | "REFUND",
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  description: String,
  referenceId: String,     // Order ID, withdrawal ID, etc.
  status: "COMPLETED" | "PENDING" | "FAILED"
}
```

### Franchise Wallet Transactions (`walletTransactionModel.js`)

Records every financial event in a franchise's wallet:

```javascript
{
  franchiseId: ObjectId,
  type: "RENT" | "ROI" | "COMMISSION" | "CREDIT" | "WITHDRAWAL_REQUEST" | 
        "WITHDRAWAL_APPROVED" | "WITHDRAWAL_REFUND" | "SETTLEMENT" | 
        "SUPPLY_PURCHASE" | "PENALTY" | "ADJUSTMENT",
  amount: Number,
  balanceBefore: Number,
  balanceAfter: Number,
  category: "INCOME" | "EXPENSE" | "PAYOUT" | "REFUND",
  status: "COMPLETED" | "PENDING" | "FAILED" | "REVERSED",
  description: String,
  referenceId: String,
  metadata: Object           // Extra info (supply order ID, etc.)
}
```

### Transaction Indexes

For fast passbook queries and admin reports:

```javascript
// Sort by franchise + date (passbook view)
{ franchiseId: 1, createdAt: -1 }

// Filter by franchise + type + date (filtered reports)
{ franchiseId: 1, type: 1, createdAt: -1 }
```

---

## Monthly Payout System (Franchise)

See [FRANCHISE_MANAGEMENT.md → Monthly Payout System](./FRANCHISE_MANAGEMENT.md#monthly-payout-system) for detailed documentation.

### Quick Summary

1. **Payout Calculation**: `GET /api/franchise/financials/payout-calculation` — Calculates the franchise's monthly entitlement.
2. **Submit Request**: `POST /api/franchise/financials/payout-request` — Submits the payout request for admin review.
3. **Admin Review**: `PATCH /api/admin/financials/monthly-payout-request/:requestId` — Admin approves/rejects.
4. **Constraint**: One payout request per franchise per month (unique index on `franchiseId + month + year`).

### Payout Request Model

```javascript
{
  franchiseId: ObjectId,
  franchiseType: "VILLAGE" | "CITY" | "DISTRICT" | "STATE",
  month: Number,               // 1-12
  year: Number,                // 2026
  roiAmount: Number,
  rentAmount: Number,
  commissionAmount: Number,
  totalAmount: Number,
  details: {
    underFranchiseSales: Number,
    underFranchiseCount: Number,
    productSalesCount: Number,
    note: String
  },
  status: "PENDING" | "ACCEPTED" | "REJECTED",
  bankSnapshot: { ... },       // Bank details at time of request
  transactionRef: String,      // Razorpay transaction reference
  rejectionReason: String,
  processedAt: Date
}
```

---

## Financial Security

### Safeguards

1. **Amount Validation** — Withdrawal amount must be positive and not exceed wallet balance.
2. **KYC Requirement** — Agents must have approved KYC before withdrawals.
3. **Bank Details Required** — Bank details must be filled and verified.
4. **Double-Debit Prevention** — Wallet balance is deducted immediately upon request, preventing double-spending.
5. **Refund on Rejection** — Rejected withdrawals are automatically refunded to the wallet.
6. **Audit Trail** — Every transaction creates a detailed record with `balanceBefore` and `balanceAfter`.
7. **Admin Approval** — All payouts require explicit admin approval.
8. **Razorpay Verification** — Payout status is verified with Razorpay API.

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/models/user.models.js` | Agent wallet fields |
| `backend/models/franchise.model.js` | Franchise wallet fields |
| `backend/models/walletTransactionModel.js` | Franchise transaction ledger |
| `backend/models/agentTransaction.model.js` | Agent transaction records |
| `backend/models/withdrawalModel.js` | Withdrawal records |
| `backend/models/withdrawalRequest.model.js` | Withdrawal request schema |
| `backend/models/financialPayout.model.js` | Financial payout records |
| `backend/models/payoutRequest.model.js` | Monthly payout requests |
| `backend/controllers/agent.controller.js` | Agent wallet & withdrawal logic |
| `backend/controllers/franchise.controller.js` | Franchise financial operations |
| `backend/controllers/payoutRequest.controller.js` | Monthly payout processing |
| `backend/controllers/admin.controller.js` | Admin payout processing |
| `backend/utils/razorpayPayoutHelper.js` | Razorpay fund account & payout |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/agent/pages/AgnetWallet.jsx` | Agent wallet UI |
| `Frontend/src/features/agent/state/agentWallet.slice.js` | Wallet Redux slice |
| `Frontend/src/features/franchise/pages/FranchiseFinance.jsx` | Franchise finance UI |
| `Frontend/src/features/franchise/pages/FranchisePayoutRequest.jsx` | Payout request UI |
| `Frontend/src/features/franchise/state/franchiseFinance.slice.js` | Finance Redux slice |
| `Frontend/src/features/admin/pages/AdminPayout.jsx` | Admin payout management |
| `Frontend/src/features/admin/state/adminPayoutSlice.js` | Admin payout Redux slice |
