# 📊 Inventory Management

## Overview

The Shourya Enterprise Inventory Management system operates on **two levels**: the **Admin Central Inventory** (main warehouse stock) and the **Franchise Inventory** (individual franchise stock). The admin manages the central inventory by purchasing and deducting stock, while franchises manage their own inventory through supply requests and direct sales. This document covers both levels of inventory management.

---

## Table of Contents

- [Inventory Architecture](#inventory-architecture)
- [Admin Central Inventory](#admin-central-inventory)
- [Franchise Inventory](#franchise-inventory)
- [Supply Chain Flow](#supply-chain-flow)
- [Inventory Data Models](#inventory-data-models)
- [Inventory APIs](#inventory-apis)
- [Stock Tracking](#stock-tracking)
- [File References](#file-references)

---

## Inventory Architecture

```
┌──────────────────────────────────────────────────────┐
│              ADMIN CENTRAL INVENTORY                  │
│         (Main Warehouse / Backend Stock)               │
│                                                        │
│    Purchase Stock → Track Items → Deduct Stock         │
│                        │                               │
│                        │  Supply Dispatch               │
│                        ▼                               │
│    ┌──────────────────────────────────────┐            │
│    │      FRANCHISE INVENTORIES           │            │
│    │                                      │            │
│    │  State Franchise  → District → City → Village     │
│    │  Each has its own stock tracking      │            │
│    │                                      │            │
│    │  Receive Supply → Track Stock → Sell  │            │
│    └──────────────────────────────────────┘            │
└──────────────────────────────────────────────────────┘
```

---

## Admin Central Inventory

### Features

1. **Purchase Stock** — Add new stock to the central inventory.
2. **View All Items** — List all inventory items with stock levels.
3. **View Item Details** — Detailed view of a specific inventory item.
4. **Deduct Stock** — Remove stock (for damage, returns, manual adjustments).

### Purchase Stock Flow

```
Admin fills purchase form
(Product, Quantity, Purchase Price)
        │
        ▼
POST /api/admin/inventory/purchase
        │
        ▼
Create/Update inventory item in MongoDB
        │
        ▼
Stock is now available for:
  - Direct agent purchases (e-commerce)
  - Franchise supply dispatch
```

### Deduct Stock Flow

```
Admin needs to deduct stock
(Damage, correction, manual removal)
        │
        ▼
POST /api/admin/inventory/deduct
        │
        ▼
Validate sufficient stock exists
        │
        ▼
Reduce stock quantity in database
        │
        ▼
Log the deduction with reason
```

### Inventory Item Fields

| Field | Type | Description |
|---|---|---|
| `product` | ObjectId | Reference to the Product model |
| `quantity` | Number | Current stock quantity |
| `purchasePrice` | Number | Cost price per unit |
| `sellingPrice` | Number | Selling price per unit |
| `totalValue` | Number | Total stock value |
| `lastRestocked` | Date | Last restock date |
| `status` | String | Active/Inactive |

---

## Franchise Inventory

Each franchise maintains its own separate inventory, which is populated through supply requests.

### Features

1. **View Inventory** — See all products in the franchise's stock.
2. **Sell from Inventory** — Record direct sales and deduct stock.
3. **Receive Supply** — Stock increases when supply requests are fulfilled.

### Sell from Inventory Flow

```
Franchise has product in stock
        │
        ▼
Customer purchases at franchise outlet
        │
        ▼
POST /api/franchise/inventory/sell
(productId, quantity, customer details)
        │
        ▼
Deduct from franchise inventory
        │
        ▼
Record sales transaction
        │
        ▼
Commission calculated (if applicable)
```

### Franchise Inventory Model

```javascript
{
  franchiseId: ObjectId,    // Which franchise owns this stock
  productId: ObjectId,      // Which product
  quantity: Number,          // Current stock level
  lastUpdated: Date          // Last modification date
}
```

---

## Supply Chain Flow

The supply chain connects admin central inventory with franchise inventories:

### Complete Supply Chain

```
Step 1: Franchise creates supply request
        POST /api/franchise/create-supply-request
        Items: [{ productId, quantity }]
        │
Step 2: Request is visible based on hierarchy
        Village → visible to City, District, State, Admin
        City → visible to District, State, Admin
        │
Step 3: Admin or Higher Franchise approves and dispatches
        PATCH /api/admin/supplies/:requestId/status
        Status: "Dispatched"
        │
Step 4: Admin's central inventory is deducted
        (if dispatched by admin)
        │
Step 5: Franchise confirms receipt
        PATCH /api/franchise/supplies/:requestId/received
        Status: "Received"
        │
Step 6: Franchise inventory is updated
        Stock increased by received quantities
```

### Visibility Rules

| Requesting Tier | Visible To |
|---|---|
| VILLAGE | City ✅, District ✅, State ✅, Admin ✅ |
| CITY | District ✅, State ✅, Admin ✅ |
| DISTRICT | State ✅, Admin ✅ |
| STATE | Admin ✅ |

### Who Can Fulfill Requests

| Fulfiller | Can Fulfill For |
|---|---|
| ADMIN | All tiers (Village, City, District, State) |
| STATE | District, City, Village in their region |
| DISTRICT | City, Village in their region |
| CITY | Village in their region |

---

## Inventory Data Models

### Central Inventory (`backend/models/inventry.model.js`)

Tracks the admin's central warehouse stock:

```javascript
{
  productId: ObjectId,          // Product reference
  productName: String,          // Quick-access product name
  quantity: Number,              // Current stock
  purchasePrice: Number,         // Cost per unit
  sellingPrice: Number,          // Sale price per unit
  minStockAlert: Number,         // Low stock threshold
  status: "Active" | "Inactive"
}
```

### Franchise Inventory (`backend/models/franchiseInventory.model.js`)

Tracks each franchise's local stock:

```javascript
{
  franchiseId: ObjectId,        // Franchise owner
  productId: ObjectId,          // Product reference
  quantity: Number,              // Current stock at franchise
  lastUpdated: Date
}
```

### Supply Request (`backend/models/supplyRequest.model.js`)

Tracks supply orders between tiers:

```javascript
{
  requestNumber: "SR-2026-001",
  requesterFranchise: ObjectId,
  requesterType: "VILLAGE",
  items: [{ productId, quantity, unitPrice, subtotal }],
  totalAmount: Number,
  status: "Pending" | "Dispatched" | "Received" | "Fulfilled",
  fulfilledBy: "ADMIN" | "STATE" | "DISTRICT" | "CITY",
  visibleTo: { city, district, state, admin }
}
```

---

## Inventory APIs

### Admin APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/inventory/purchase` | Purchase and add stock |
| `POST` | `/api/admin/inventory/deduct` | Deduct/remove stock |
| `GET` | `/api/admin/inventory/list` | List all inventory items |
| `GET` | `/api/admin/inventory/:itemId` | Get item details |
| `GET` | `/api/admin/supplies` | View all supply requests |
| `POST` | `/api/admin/supplies/send` | Direct supply dispatch |
| `PATCH` | `/api/admin/supplies/:requestId/status` | Update supply status |

### Franchise APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/franchise/inventory` | View franchise inventory |
| `POST` | `/api/franchise/inventory/sell` | Sell from inventory |
| `POST` | `/api/franchise/create-supply-request` | Create supply request |
| `GET` | `/api/franchise/get-supply-requests` | View supply requests |
| `PATCH` | `/api/franchise/supplies/:requestId/received` | Confirm supply received |
| `PATCH` | `/api/franchise/supplies/:requestId/fulfill` | Fulfill subordinate supply |

---

## Stock Tracking

### Key Metrics

- **Total Stock Value** — Sum of (quantity × purchasePrice) for all items
- **Low Stock Items** — Items below their `minStockAlert` threshold
- **Stock Movement** — History of purchases, sales, and transfers
- **Franchise Stock Levels** — Per-franchise inventory status

### Stock Update Events

| Event | Effect |
|---|---|
| Admin purchases stock | Central inventory ↑ |
| Admin deducts stock | Central inventory ↓ |
| Agent buys product (e-commerce) | Product stock ↓ |
| Supply dispatched to franchise | Central inventory ↓ |
| Franchise receives supply | Franchise inventory ↑ |
| Franchise makes a sale | Franchise inventory ↓ |

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/models/inventry.model.js` | Central inventory schema |
| `backend/models/franchiseInventory.model.js` | Franchise inventory schema |
| `backend/models/FranchiseInventory.js` | Franchise inventory helper |
| `backend/models/supplyRequest.model.js` | Supply request schema |
| `backend/controllers/admin.controller.js` | Admin inventory operations |
| `backend/controllers/franchise.controller.js` | Franchise inventory operations |
| `backend/controllers/franchiseMangment/adminSupply.Controller.js` | Admin supply management |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/inventory/pages/Inventory.jsx` | Admin inventory management UI |
| `Frontend/src/features/inventory/state/inventory.slice.js` | Inventory Redux slice |
| `Frontend/src/features/franchise/pages/Inventory.jsx` | Franchise inventory UI |
| `Frontend/src/features/franchise/pages/Supplyrequest.jsx` | Supply request UI |
| `Frontend/src/features/admin/franchiseMangement/pages/ManageFranchiseSupplyUI.jsx` | Admin supply management UI |
