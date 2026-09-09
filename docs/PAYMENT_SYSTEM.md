# 💳 Payment System

## Overview

The Shourya Enterprise Payment System is powered by **Razorpay** — India's leading payment gateway. The system handles the complete payment lifecycle: creating a Razorpay order, processing payment on the frontend, verifying the payment signature on the backend, and then distributing MLM bonuses (BV, Direct Bonus, Matching Bonus) to the relevant agents in the binary tree. After successful payment, a receipt is generated for the user.

---

## Table of Contents

- [Payment Flow Overview](#payment-flow-overview)
- [Step 1: Create Razorpay Order](#step-1-create-razorpay-order)
- [Step 2: Frontend Payment UI](#step-2-frontend-payment-ui)
- [Step 3: Verify and Distribute MLM](#step-3-verify-and-distribute-mlm)
- [Step 4: Receipt Generation](#step-4-receipt-generation)
- [MLM Distribution Logic](#mlm-distribution-logic)
- [Order Model](#order-model)
- [Error Handling](#error-handling)
- [File References](#file-references)

---

## Payment Flow Overview

The complete payment process follows a **3-step flow**:

```
┌─────────────────────────────────────────────────────────────┐
│                     PAYMENT FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  STEP 1: Create Order                                        │
│  Agent's Cart → POST /api/payment/create-order               │
│  Backend creates a Razorpay Order with total amount           │
│  Returns: razorpay_order_id                                  │
│                                                              │
│  STEP 2: Payment (Frontend)                                  │
│  Razorpay Checkout modal opens                               │
│  Agent completes payment (UPI/Card/NetBanking)               │
│  Returns: razorpay_payment_id + razorpay_signature           │
│                                                              │
│  STEP 3: Verify & Distribute                                 │
│  POST /api/payment/verify-and-distribute                     │
│  Backend verifies signature using HMAC SHA256                 │
│  Creates Order record in database                            │
│  Distributes BV to upline agents                             │
│  Credits Direct Bonus to sponsor                             │
│  Calculates Matching Bonus for eligible ancestors             │
│  If activation package → Activates agent ID                  │
│  Returns: order_id for receipt                               │
│                                                              │
│  STEP 4: Receipt                                             │
│  Redirect to /receipt/:orderId                               │
│  Display order details, items, payment info                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create Razorpay Order

### API: `POST /api/payment/create-order`

**Authentication**: Required (JWT token)

### Process

1. Frontend sends the cart items and total amount.
2. Backend initializes the **Razorpay SDK** with API key and secret.
3. Creates a Razorpay order using `razorpay.orders.create()`.
4. Returns the order details to the frontend.

### Request Body

```json
{
  "amount": 5000,
  "currency": "INR",
  "cartItems": [
    {
      "productId": "64abc...",
      "quantity": 1,
      "price": 5000
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "order": {
    "id": "order_OxxxxxxxxXXXXXX",
    "amount": 500000,
    "currency": "INR",
    "status": "created"
  },
  "key": "rzp_test_xxxxxxxxxxxx"
}
```

> **Note**: Razorpay amounts are in **paise** (smallest currency unit). ₹5000 = 500000 paise.

---

## Step 2: Frontend Payment UI

### Razorpay Checkout Integration

The frontend uses Razorpay's JavaScript Checkout SDK to render the payment modal:

```javascript
const options = {
  key: razorpayKey,           // From create-order response
  amount: order.amount,       // In paise
  currency: "INR",
  name: "Shourya Enterprise",
  description: "Product Purchase",
  order_id: order.id,         // Razorpay order ID
  handler: function (response) {
    // Called after successful payment
    // response.razorpay_payment_id
    // response.razorpay_order_id
    // response.razorpay_signature
    verifyAndDistribute(response);
  },
  prefill: {
    name: user.fullName,
    email: user.email,
    contact: user.contact
  }
};

const razorpayCheckout = new window.Razorpay(options);
razorpayCheckout.open();
```

### Payment Methods Supported

- 💳 Credit/Debit Cards
- 🏦 Net Banking
- 📱 UPI (Google Pay, PhonePe, Paytm)
- 💰 Wallets

---

## Step 3: Verify and Distribute MLM

### API: `POST /api/payment/verify-and-distribute`

**Authentication**: Required (JWT token)

### Process

1. **Receive** `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` from frontend.
2. **Verify signature** using HMAC SHA256:
   ```
   generated_signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
   ```
3. **Compare** generated signature with received signature.
4. **If valid**:
   - Create an Order document in MongoDB.
   - Generate a unique receipt number.
   - Deduct product stock.
   - If activation package → activate the agent's ID.
   - Distribute BV to all upline agents.
   - Credit Direct Bonus to the sponsor.
   - Calculate and credit Matching Bonus.
   - Create transaction records.
5. **Return** the order ID for receipt page navigation.

### Signature Verification

```javascript
const crypto = require("crypto");

const generated_signature = crypto
  .createHmac("sha256", RAZORPAY_KEY_SECRET)
  .update(razorpay_order_id + "|" + razorpay_payment_id)
  .digest("hex");

if (generated_signature !== razorpay_signature) {
  throw new Error("Payment verification failed!");
}
```

---

## Step 4: Receipt Generation

### Page: `/receipt/:orderId`

After successful payment, the user is redirected to the receipt page.

### API: `GET /api/payment/order/:orderId`

Returns the complete order details for the receipt.

### Receipt Displays

| Section | Content |
|---|---|
| **Order Info** | Receipt number, order date, payment method |
| **Customer Info** | Agent name, email, contact, distributor ID |
| **Items** | Product name, quantity, price, PV for each item |
| **Payment** | Total amount, Razorpay payment ID, status |
| **MLM Info** | Total BV earned, Direct Bonus, activation status |

### Receipt Response

```json
{
  "success": true,
  "order": {
    "_id": "64abc...",
    "receiptNumber": "RCP-2026-00001",
    "items": [
      {
        "name": "Premium Health Kit",
        "price": 5000,
        "quantity": 1,
        "pv": 300
      }
    ],
    "totalAmount": 5000,
    "earnedPV": 300,
    "paymentMethod": "RAZORPAY",
    "paymentStatus": "COMPLETED",
    "razorpayOrderId": "order_Oxxxxxxx",
    "razorpayPaymentId": "pay_Oxxxxxxx",
    "createdAt": "2026-09-09T10:00:00Z"
  }
}
```

---

## MLM Distribution Logic

After payment verification, the system distributes MLM rewards:

### 1. Direct Bonus Distribution

```
Agent X purchases product with directCommission = ₹200
        │
        ▼
Find Sponsor (sponserId)
        │
        ▼
Credit ₹200 to Sponsor's walletBalance
Credit ₹200 to Sponsor's totalDirectBonus
Credit ₹200 to Sponsor's totalEarning
        │
        ▼
Create Transaction Record
```

### 2. BV Distribution to Upline

```
Agent X purchases product with bv = 500
        │
        ▼
Traverse up the binary tree from Agent X to root
        │
        ▼
For each ancestor:
  - Determine which leg Agent X is in (left/right)
  - Add 500 BV to that leg's counter
  - Check for matching opportunity
```

### 3. Matching Bonus Calculation

```
For each ancestor after BV update:
  - If leftBV > 0 AND rightBV > 0:
      matchedBV = MIN(leftBV, rightBV)
      bonus = matchedBV × matchingPercentage
      Credit bonus to ancestor's wallet
      Deduct matched BV from both legs
      Carry forward remaining BV
```

### 4. Activation (If Applicable)

```
If product.isActivationPackage === true:
  - agent.isActivated = true
  - agent.activationDate = Date.now()
  - agent.rank = product.packageTier
  - agent.packageAmount = product.price
```

---

## Order Model

The order document stores the complete purchase record:

```javascript
{
  user: ObjectId,                    // Purchasing agent
  items: [
    {
      product: ObjectId,
      name: "Premium Health Kit",
      price: 5000,
      quantity: 1,
      pv: 300
    }
  ],
  totalAmount: 5000,
  earnedPV: 300,
  bonusPointsEarned: 0,
  receiptNumber: "RCP-2026-00001",   // Unique receipt number
  paymentMethod: "RAZORPAY",
  paymentStatus: "COMPLETED",        // PENDING / COMPLETED / FAILED
  razorpayOrderId: "order_Oxxxxxxx",
  razorpayPaymentId: "pay_Oxxxxxxx"
}
```

---

## Error Handling

| Scenario | HTTP Status | Response |
|---|---|---|
| Invalid cart items | 400 | Product not found or out of stock |
| Razorpay order creation fails | 500 | Payment gateway error |
| Signature verification fails | 400 | Payment verification failed |
| Duplicate receipt number | 500 | Internal error, retry |
| Insufficient stock | 400 | Product stock insufficient |
| Unauthenticated user | 401 | Login required |

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/controllers/payment.controller.js` | Payment creation, verification, MLM distribution |
| `backend/routes/payment.routes.js` | Payment route definitions |
| `backend/models/order.model.js` | Order schema |
| `backend/config/config.js` | Razorpay API key & secret configuration |
| `backend/utils/razorpayPayoutHelper.js` | Razorpay payout utility functions |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/Payment/pages/Payment.jsx` | Payment page with Razorpay checkout |
| `Frontend/src/features/Payment/service/payment.api.js` | Payment API service layer |
| `Frontend/src/features/Payment/state/payment.slice.js` | Payment Redux slice |
| `Frontend/src/features/Payment/hook/` | Payment custom hooks |
| `Frontend/src/components/ReceiptPage.jsx` | Order receipt display page |
