# 🌳 MLM Binary Tree System

## Overview

The Shourya Enterprise platform uses a **Binary MLM (Multi-Level Marketing)** compensation plan. Every agent is placed in a binary tree structure where each node (agent) can have a maximum of **two direct children** — a **left child** and a **right child**. The system calculates Business Volume (BV) flowing through each leg and distributes commissions based on binary matching and direct referral bonuses.

---

## Table of Contents

- [Binary Tree Structure](#binary-tree-structure)
- [Agent Registration & Placement](#agent-registration--placement)
- [Business Volume (BV) System](#business-volume-bv-system)
- [Bonus Types](#bonus-types)
- [Activation Package System](#activation-package-system)
- [Rank System](#rank-system)
- [Data Model (User Schema)](#data-model-user-schema)
- [How BV Flows Up the Tree](#how-bv-flows-up-the-tree)
- [File References](#file-references)

---

## Binary Tree Structure

In a binary MLM plan, every agent has exactly **two positions** beneath them:

```
                    [Agent A]
                   /         \
            [Agent B]     [Agent C]
           /        \     /        \
      [Agent D] [Agent E] [Agent F] [Agent G]
```

### Key Concepts

| Term | Description |
|---|---|
| **Parent Agent** | The agent directly above in the tree (the one who placed you) |
| **Sponsor** | The agent who referred you (may or may not be the parent) |
| **Left Child** | The agent placed in the left position |
| **Right Child** | The agent placed in the right position |
| **Left Leg** | The entire sub-tree hanging from the left child |
| **Right Leg** | The entire sub-tree hanging from the right child |
| **Power Leg** | The leg with more BV (stronger side) |
| **Weaker Leg** | The leg with less BV (used for matching bonus calculation) |
| **Spillover** | When a sponsor already has both positions filled, the new agent "spills over" to a deeper level |

---

## Agent Registration & Placement

### How a New Agent is Placed

1. **New agent registers** with a `sponserId` (the referrer's Distributor ID).
2. **Sponsor is located** in the database using the Distributor ID.
3. **The system finds** the next available position in the binary tree:
   - If the sponsor's `leftChild` is empty → place as left child
   - If the sponsor's `rightChild` is empty → place as right child
   - If both are filled → use **spillover logic** to find the first available position down the tree (usually BFS/DFS traversal)
4. **Parent-child links are created**:
   - `parentAgentId` on the new agent points to their direct parent in the tree
   - `leftChild` or `rightChild` on the parent is updated with the new agent's ID
5. **Team counters are incremented**:
   - `totalDirects` on the sponsor is increased by 1
   - `totalLeftAgents` or `totalRightAgents` on all ancestors is updated

### Registration Data Flow

```
New Agent Registration
        │
        ▼
Find Sponsor by Distributor ID
        │
        ▼
Find Available Position in Binary Tree
        │
        ├── Sponsor has left slot free → Place as Left Child
        ├── Sponsor has right slot free → Place as Right Child
        └── Both filled → Spillover to deeper level
        │
        ▼
Create User Document
        │
        ▼
Update Parent's leftChild/rightChild Reference
        │
        ▼
Increment Team Counters Up the Tree
```

---

## Business Volume (BV) System

**Business Volume (BV)** is the numerical value assigned to each product. When an agent purchases a product, its BV flows up through the binary tree to all ancestors.

### How BV Works

1. Each product has a `bv` field (e.g., a product worth ₹5000 may carry 500 BV).
2. When Agent X purchases a product with 500 BV:
   - The BV is added to the **corresponding leg** of every ancestor in the tree.
   - If Agent X is in the **left sub-tree** of Agent A → Agent A's `leftBV` increases by 500.
   - If Agent X is in the **right sub-tree** of Agent A → Agent A's `rightBV` increases by 500.

### BV Fields in the User Model

| Field | Description |
|---|---|
| `leftBV` | Current balance BV in the left leg (resets after matching) |
| `rightBV` | Current balance BV in the right leg (resets after matching) |
| `totalLeftBV` | Lifetime accumulated BV from the left leg |
| `totalRightBV` | Lifetime accumulated BV from the right leg |

### BV Flow Example

```
        [Agent A]
       leftBV: 500  rightBV: 300
       /              \
  [Agent B]         [Agent C]
  leftBV: 200       leftBV: 300
  rightBV: 100      rightBV: 0
   /       \           /
[Agent D] [Agent E] [Agent F]

If Agent D purchases a product with 200 BV:
- Agent B's leftBV += 200
- Agent A's leftBV += 200  (Agent D is in A's left sub-tree)
```

---

## Bonus Types

### 1. Direct Referral Bonus

- **Triggered when**: A directly sponsored agent purchases a product.
- **Amount**: Defined by the `directCommission` field on the product.
- **Credited to**: The sponsor's `totalDirectBonus` and `walletBalance`.

### 2. Binary Matching Bonus

- **Triggered when**: BV accumulates in both legs.
- **Calculation**: Based on the **weaker leg's BV**.
- **Formula**: `Matching Bonus = weaker_leg_BV × matching_percentage`
- **After matching**: The matched BV is deducted from both legs; remaining BV carries forward.

### Example of Binary Matching

```
Before Matching:
  leftBV = 1000
  rightBV = 600

Matching:
  Weaker leg = right (600 BV)
  Matched amount = 600 × 10% = ₹60 bonus

After Matching:
  leftBV = 1000 - 600 = 400 (carry forward)
  rightBV = 600 - 600 = 0
```

### Bonus Distribution Flow

```
Agent Purchases Product
        │
        ▼
BV is added to all ancestors' legs
        │
        ▼
Direct Bonus credited to Sponsor
        │
        ▼
Binary Matching calculated for all eligible ancestors
        │
        ▼
Matching Bonus credited to walletBalance
        │
        ▼
Transaction records created
```

---

## Activation Package System

An agent's ID must be **activated** before they can earn commissions. Activation happens when the agent purchases a product marked as an **Activation Package**.

### How Activation Works

1. Product model has `isActivationPackage: true` for activation products.
2. When agent purchases this product:
   - `isActivated` is set to `true`
   - `activationDate` is set to the current date
   - `packageAmount` is set to the product price
   - `rank` is set based on `packageTier` (Starter, Bronze, Silver, Gold, Diamond)
3. Only activated agents generate BV for the upline.
4. Non-activated agents exist in the tree but don't contribute to bonus calculations.

### Package Tiers

| Tier | Description |
|---|---|
| `None` | Regular product, no activation |
| `Starter` | Entry-level activation package |
| `Bronze` | Bronze rank activation |
| `Silver` | Silver rank activation |
| `Gold` | Gold rank activation |
| `Diamond` | Highest tier activation |

---

## Rank System

Agents can advance through ranks based on their package tier and team performance.

| Rank | How to Achieve |
|---|---|
| **Distributor** | Default rank upon registration |
| **Bronze** | Purchase Bronze activation package |
| **Silver** | Purchase Silver activation package |
| **Gold** | Purchase Gold activation package |
| **Diamond** | Purchase Diamond activation package |

Higher ranks may unlock additional benefits like higher matching percentages, leadership bonuses, and priority payouts.

---

## Data Model (User Schema)

The binary tree structure is stored in the `User` model (`backend/models/user.models.js`):

### Tree Pointers

```javascript
leftChild:       ObjectId → ref "user"    // Left child agent
rightChild:      ObjectId → ref "user"    // Right child agent
parentAgentId:   ObjectId → ref "user"    // Direct parent in tree
position:        "left" | "right" | null  // Position under parent
sponserId:       String                   // Sponsor's Distributor ID
```

### Team Counters

```javascript
totalDirects:      Number  // Count of directly referred agents
totalLeftAgents:   Number  // Total agents in left sub-tree
totalRightAgents:  Number  // Total agents in right sub-tree
activeLeftAgents:  Number  // Activated agents in left sub-tree
activeRightAgents: Number  // Activated agents in right sub-tree
```

### BV & Financial Counters

```javascript
leftBV:             Number  // Current matching BV (left)
rightBV:            Number  // Current matching BV (right)
totalLeftBV:        Number  // Lifetime BV (left)
totalRightBV:       Number  // Lifetime BV (right)
walletBalance:      Number  // Withdrawable earnings
totalMatchingBonus: Number  // Lifetime matching earnings
totalDirectBonus:   Number  // Lifetime direct earnings
totalEarning:       Number  // Lifetime total earnings
totalWithdrawn:     Number  // Total withdrawn amount
pendingPayout:      Number  // Pending withdrawal requests
```

---

## How BV Flows Up the Tree

When an agent purchases a product, the BV distribution algorithm works as follows:

```
FUNCTION distributeBV(purchasingAgent, bvAmount):
    currentAgent = purchasingAgent.parentAgentId
    purchaserPosition = purchasingAgent.position

    WHILE currentAgent IS NOT NULL:
        IF purchasingAgent is in currentAgent's LEFT sub-tree:
            currentAgent.leftBV += bvAmount
            currentAgent.totalLeftBV += bvAmount
        ELSE:
            currentAgent.rightBV += bvAmount
            currentAgent.totalRightBV += bvAmount

        // Check for binary matching opportunity
        IF currentAgent.leftBV > 0 AND currentAgent.rightBV > 0:
            matchedBV = MIN(currentAgent.leftBV, currentAgent.rightBV)
            bonus = matchedBV × MATCHING_PERCENTAGE
            currentAgent.walletBalance += bonus
            currentAgent.totalMatchingBonus += bonus
            currentAgent.leftBV -= matchedBV
            currentAgent.rightBV -= matchedBV

        // Move up to next ancestor
        currentAgent = currentAgent.parentAgentId
```

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/models/user.models.js` | User schema with complete binary tree structure |
| `backend/controllers/auth.controller.js` | Registration with tree placement logic |
| `backend/controllers/agent.controller.js` | Dashboard data and network tree fetching |
| `backend/controllers/payment.controller.js` | BV distribution after purchase |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/agent/pages/AgentNetwork.jsx` | Binary tree network visualization |
| `Frontend/src/features/agent/pages/AgentDashboard.jsx` | BV and team stats display |
