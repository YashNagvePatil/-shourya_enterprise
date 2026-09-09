# 👤 Agent Management

## Overview

Agents (also called Distributors) are the core users of the MLM system. Each agent has a personalized dashboard, profile management, KYC verification, bank detail management, wallet system with withdrawal capability, and a network tree view. This document explains how each of these features works in detail.

---

## Table of Contents

- [Agent Dashboard](#agent-dashboard)
- [Agent Profile](#agent-profile)
- [KYC Submission](#kyc-submission)
- [Bank Details Management](#bank-details-management)
- [Agent Network Tree](#agent-network-tree)
- [Agent Wallet & Earnings](#agent-wallet--earnings)
- [Shopping Cart](#shopping-cart)
- [Agent Status Management (Admin)](#agent-status-management-admin)
- [File References](#file-references)

---

## Agent Dashboard

The Agent Dashboard is the main landing page after login. It displays a comprehensive overview of the agent's business metrics.

### Data Displayed

| Metric | Description |
|---|---|
| **Distributor ID** | Unique agent identifier (e.g., AGT1001) |
| **Rank** | Current rank (Distributor, Bronze, Silver, Gold, Diamond) |
| **Status** | Account status (Pending, Active, Blocked) |
| **Is Activated** | Whether the agent has purchased an activation package |
| **Total Directs** | Number of directly sponsored agents |
| **Left Leg Agents** | Total agents in the left binary leg |
| **Right Leg Agents** | Total agents in the right binary leg |
| **Active Left Agents** | Activated agents in left leg |
| **Active Right Agents** | Activated agents in right leg |
| **Left BV** | Current Business Volume in left leg |
| **Right BV** | Current Business Volume in right leg |
| **Total Earnings** | Lifetime total earnings |
| **Wallet Balance** | Current withdrawable balance |
| **Total Matching Bonus** | Cumulative binary matching earnings |
| **Total Direct Bonus** | Cumulative direct referral earnings |
| **Total Withdrawn** | Total amount paid out |
| **Pending Payout** | Withdrawal requests in process |

### How It Works

1. Agent navigates to `/agent/dashboard`.
2. Frontend dispatches the `dashBoard` thunk action.
3. API call: `GET /api/agent/dashBoard` (requires authentication).
4. Backend fetches the full user document from MongoDB (or Redis cache).
5. Dashboard page renders the data with Recharts for visual analytics.

---

## Agent Profile

The profile page allows agents to view and update their personal information.

### Features

1. **View Profile** — Displays all personal info, address, KYC status, and bank details.
2. **Update Personal Info** — Edit full name, contact number, email, and shipping address.
3. **Submit KYC** — Upload PAN Card and Aadhaar Card images.
4. **Update Bank Details** — Add/edit bank account and UPI information for payouts.

### Profile Update Flow

```
Agent fills form → PUT /api/agent/profile/update → Validate & Update MongoDB → Return updated profile
```

### Address Fields

| Field | Type | Description |
|---|---|---|
| `street` | String | Street address |
| `city` | String | City name |
| `state` | String | State name |
| `pincode` | String | PIN/ZIP code |

---

## KYC Submission

KYC (Know Your Customer) is mandatory for agents to receive payouts.

### Documents Required

1. **PAN Card Image** — Government-issued PAN card photograph
2. **Aadhaar Card Image** — Government-issued Aadhaar card photograph

### KYC Flow

1. Agent navigates to the Profile page → KYC section.
2. Uploads PAN Card and Aadhaar Card images.
3. Frontend sends `POST /api/agent/profile/kyc` with the image data.
4. Backend uploads images to **Cloudinary** via the storage service.
5. The Cloudinary secure URLs are saved to `panCardImage` and `adharCardImage` fields.
6. KYC status is set to `Pending`.
7. Admin reviews and changes status to `Approved` or `Rejected`.

### KYC Status Flow

```
Not_Submitted → Pending → Approved ✅
                       → Rejected ❌ (Agent can re-submit)
```

### KYC Status Values

| Status | Description |
|---|---|
| `Not_Submitted` | No documents uploaded yet |
| `Pending` | Documents submitted, awaiting admin review |
| `Approved` | KYC verified successfully |
| `Rejected` | Documents rejected, needs re-submission |

---

## Bank Details Management

Agents must add their bank details to receive payout withdrawals.

### Fields

| Field | Description |
|---|---|
| `accountNumber` | Bank account number |
| `ifscCode` | IFSC code of the branch |
| `bankName` | Name of the bank |
| `accountHolderName` | Name on the bank account |
| `upiId` | UPI ID for quick payments |

### Update Flow

1. Agent fills the bank details form.
2. Frontend sends `PUT /api/agent/profile/bank-details`.
3. Backend validates and updates the `bankDetails` sub-document.
4. For Razorpay payouts, a `razorpayFundAccountId` is created/linked.

---

## Agent Network Tree

The network tree is a visual representation of the agent's binary MLM downline.

### How It Works

1. Agent navigates to `/agent/network`.
2. Frontend dispatches the `netWorkTree` action.
3. API call: `GET /api/agent/networkTree`.
4. Backend recursively fetches the agent's `leftChild` and `rightChild` references from the User model.
5. Returns a tree structure with each node containing: name, distributor ID, status, activation state, and BV points.
6. Frontend renders an interactive tree visualization.

### Tree Structure (Binary)

```
         [Root Agent]
        /            \
   [Left Child]   [Right Child]
    /      \        /       \
  [LL]    [LR]    [RL]     [RR]
```

Each agent can have at most **2 direct children** (left and right). When an agent registers new members beyond 2, the system uses **spillover** to place them deeper in the tree.

---

## Agent Wallet & Earnings

See the [WALLET_AND_PAYOUT.md](./WALLET_AND_PAYOUT.md) document for detailed wallet and payout documentation.

### Quick Summary

- **Wallet Balance** — Current withdrawable amount
- **Direct Bonus** — Earned when a directly sponsored agent makes a purchase
- **Matching Bonus** — Earned from binary leg BV matching
- **Total Earnings** — Lifetime sum of all bonuses
- **Pending Payout** — Amount requested for withdrawal but not yet processed
- **Total Withdrawn** — Amount already paid out

---

## Shopping Cart

Agents can browse products and add them to a shopping cart before purchasing.

### Cart Operations

| Action | API Endpoint | Method |
|---|---|---|
| Get Cart | `/api/agent/getCart` | `GET` |
| Add to Cart | `/api/agent/addCart` | `POST` |
| Remove from Cart | `/api/agent/:productId` | `DELETE` |

### Cart to Purchase Flow

1. Agent adds products to cart.
2. Proceeds to the Payment page.
3. Razorpay order is created → Payment is completed.
4. MLM points (BV, PV) are distributed to the upline.
5. If an activation package is purchased, the agent's ID is activated.
6. A receipt is generated.

---

## Agent Status Management (Admin)

Admins can manage agent accounts from the admin panel.

### Available Actions

| Action | API | Description |
|---|---|---|
| View Agent List | `GET /api/admin/agent/management` | Search, filter, paginate agents |
| View Agent Details | `GET /api/admin/agent/:id` | Full agent profile and tree data |
| Toggle Status | `PATCH /api/admin/agent/status/:id` | Activate or Block an agent |
| Process Payout | `POST /api/admin/payout/process` | Manually process agent withdrawals |

### Agent Status Values

| Status | Description |
|---|---|
| `Pending` | Newly registered, awaiting activation |
| `Active` | Fully functional account |
| `Blocked` | Temporarily suspended by admin |

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/controllers/agent.controller.js` | All agent operations (dashboard, profile, wallet, cart, KYC) |
| `backend/controllers/admin.controller.js` | Admin-side agent management |
| `backend/routes/agentDashboard.routes.js` | Agent API route definitions |
| `backend/models/user.models.js` | Agent schema with binary tree fields |
| `backend/models/agentTransaction.model.js` | Agent transaction history |
| `backend/services/storage.service.js` | Cloudinary upload service for KYC images |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/agent/pages/AgentDashboard.jsx` | Dashboard UI with metrics and charts |
| `Frontend/src/features/agent/pages/AgentProfile.jsx` | Profile, KYC, and bank details management |
| `Frontend/src/features/agent/pages/AgnetWallet.jsx` | Wallet and withdrawal UI |
| `Frontend/src/features/agent/pages/AgentNetwork.jsx` | Binary tree network visualization |
| `Frontend/src/features/agent/state/agent.slice.js` | Agent Redux slice |
| `Frontend/src/features/agent/state/agentProfile.slice.js` | Profile Redux slice |
| `Frontend/src/features/agent/state/agentWallet.slice.js` | Wallet Redux slice |
