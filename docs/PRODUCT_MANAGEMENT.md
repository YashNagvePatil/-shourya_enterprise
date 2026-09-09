# 📦 Product Management

## Overview

The Shourya Enterprise Product Management system handles the complete lifecycle of products — from creation by the admin with Cloudinary image upload, to product browsing by agents/customers, to the MLM-specific pricing structure (MRP, Distributor Price, BV, PV). Products are cached using Redis for high-performance browsing and include activation package support for MLM agent ID activation.

---

## Table of Contents

- [Product Schema](#product-schema)
- [Product Creation (Admin)](#product-creation-admin)
- [Product Categories](#product-categories)
- [MLM Pricing Structure](#mlm-pricing-structure)
- [Activation Packages](#activation-packages)
- [Product Browsing](#product-browsing)
- [Product Details Page](#product-details-page)
- [Image Management (Cloudinary)](#image-management-cloudinary)
- [Redis Caching](#redis-caching)
- [Franchise Supply Products](#franchise-supply-products)
- [File References](#file-references)

---

## Product Schema

Every product stores comprehensive information for both e-commerce and MLM operations:

### Basic Details

| Field | Type | Description |
|---|---|---|
| `name` | String | Product name (required) |
| `slug` | String | URL-friendly slug (auto-generated) |
| `sku` | String | Stock Keeping Unit (unique, uppercase) |
| `description` | String | Full product description |
| `shortDescription` | String | Brief summary |
| `brand` | String | Brand name (default: "Generic") |

### Pricing & MLM Fields

| Field | Type | Description |
|---|---|---|
| `mrp` | Number | Maximum Retail Price |
| `price` | Number | Distributor/Selling Price (DP) |
| `bv` | Number | Business Volume for binary matching |
| `pv` | Number | Point Value for rank advancement |
| `directCommission` | Number | Direct sponsor bonus amount |

### Inventory & Status

| Field | Type | Description |
|---|---|---|
| `stock` | Number | Available quantity |
| `isAvailable` | Boolean | Whether product can be purchased |
| `isActive` | Boolean | Admin toggle for product visibility |
| `gstPercentage` | Number | GST tax rate (default: 18%) |

### MLM Configuration

| Field | Type | Description |
|---|---|---|
| `isActivationPackage` | Boolean | Whether purchasing activates agent ID |
| `packageTier` | String | Rank tier (None/Starter/Bronze/Silver/Gold/Diamond) |

### Franchise Supply

| Field | Type | Description |
|---|---|---|
| `isAvailableForFranchiseSupply` | Boolean | Whether franchise can request this product |
| `supplyCategory` | String | Supply category (RESELL_PRODUCT/PACKAGING/EQUIPMENT/MARKETING) |

---

## Product Creation (Admin)

### How Admin Creates a Product

1. Admin navigates to `/admin/createProduct`.
2. Fills out the product form with all required fields.
3. Uploads product images (multiple images supported).
4. Submits the form.

### Backend Creation Flow

```
Admin submits product form
        │
        ▼
POST /api/admin/createProduct
        │
        ▼
Validate all required fields
        │
        ▼
Upload images to Cloudinary
(Returns URL + public_id for each image)
        │
        ▼
Auto-generate slug from product name
("Premium Health Kit" → "premium-health-kit")
        │
        ▼
Create product document in MongoDB
        │
        ▼
Invalidate Redis cache (products key)
        │
        ▼
Return created product
```

### Slug Generation

The system automatically creates URL-friendly slugs using a `pre('save')` hook:

```javascript
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }
});
```

**Example**: `"Premium Health Kit - 2026"` → `"premium-health-kit--2026"`

---

## Product Categories

Products are organized into four categories:

| Category | Description |
|---|---|
| `BEST SELLERS` | Top-performing, high-demand products |
| `FEATURED COLLECTION` | Hand-picked premium products |
| `EXECUTIVE BUNDLES` | High-value package deals |
| `NEW ARRIVALS` | Recently added products |

Categories are validated by a Mongoose enum to ensure consistency.

---

## MLM Pricing Structure

Each product has a multi-layered pricing structure designed for the MLM system:

```
┌─────────────────────────────────────────┐
│            Product Pricing               │
├─────────────────────────────────────────┤
│  MRP (₹)        → Customer retail price  │
│  Price / DP (₹) → Distributor price      │
│  BV              → Binary tree matching   │
│  PV              → Point value for ranks  │
│  Direct Commission → Sponsor's bonus     │
│  GST (%)         → Tax percentage         │
└─────────────────────────────────────────┘
```

### Example Product Pricing

```
Product: "Premium Health Supplement"
  MRP: ₹5,000
  Distributor Price (DP): ₹3,500
  BV: 500
  PV: 300
  Direct Commission: ₹200
  GST: 18%
  
  Savings for Agent: ₹5,000 - ₹3,500 = ₹1,500
  Sponsor's Bonus: ₹200 (from directCommission)
  Binary Tree BV: 500 (flows to upline legs)
```

---

## Activation Packages

Some products serve as **activation packages** that activate an agent's MLM ID when purchased.

### How It Works

1. Admin creates a product with `isActivationPackage: true`.
2. Admin sets the `packageTier` (e.g., "Gold").
3. When an agent purchases this product:
   - `user.isActivated = true`
   - `user.activationDate = Date.now()`
   - `user.packageAmount = product.price`
   - `user.rank = product.packageTier`
4. The agent can now generate BV for their upline and earn commissions.

---

## Product Browsing

### Homepage Product Display

The homepage features a **product slider** that displays products by category. Products are fetched from the backend with Redis caching for fast loading.

### API: `GET /api/home`

Returns all active products with optional filtering and pagination.

### Response Structure

```json
{
  "success": true,
  "products": [
    {
      "_id": "64abc...",
      "name": "Premium Health Kit",
      "slug": "premium-health-kit",
      "mrp": 5000,
      "price": 3500,
      "bv": 500,
      "category": "BEST SELLERS",
      "images": [{ "url": "https://cloudinary.com/...", "public_id": "..." }],
      "isAvailable": true,
      "stock": 150
    }
  ]
}
```

---

## Product Details Page

When a user clicks on a product, they are taken to `/products/:id` which displays:

1. **Product images** — Gallery with multiple images
2. **Product name and description** — Full details
3. **Pricing information** — MRP, DP, savings amount
4. **BV/PV points** — MLM-specific metrics
5. **Stock availability** — Whether the product is in stock
6. **Add to Cart button** — Adds the product to the shopping cart
7. **Related products** — Products from the same category

### API: `GET /api/home/:id`

Returns the product details along with related products from the same category. Response is cached for 5 minutes in Redis.

---

## Image Management (Cloudinary)

### Upload Flow

1. Admin selects product images in the creation form.
2. Images are sent as base64 or multipart form data.
3. Backend uploads to **Cloudinary** using the Cloudinary SDK.
4. Cloudinary returns:
   - `secure_url` — The HTTPS URL of the uploaded image
   - `public_id` — Unique identifier for the image (used for deletion)
5. Both fields are stored in the product's `images` array.

### Image Array Structure

```javascript
images: [
  {
    url: "https://res.cloudinary.com/cloud-name/image/upload/v123/product1.jpg",
    public_id: "product1"
  },
  {
    url: "https://res.cloudinary.com/cloud-name/image/upload/v123/product2.jpg",
    public_id: "product2"
  }
]
```

---

## Redis Caching

Product data is cached using Redis to minimize database queries and improve page load times.

### Cache Configuration

- **Cache Key**: `products`
- **TTL**: 300 seconds (5 minutes)
- **Middleware**: `cacheMiddleware(300, "products")` applied to product routes

### How It Works

```
Request comes in for GET /api/home
        │
        ▼
cacheMiddleware checks Redis for key "products"
        │
        ├── Cache HIT → Return cached response instantly
        │
        └── Cache MISS → Query MongoDB → Cache result → Return response
```

### Cache Invalidation

When admin creates or modifies a product, the Redis cache for the `products` key is invalidated, ensuring users see the latest data.

---

## Franchise Supply Products

Products can be marked as available for franchise supply ordering:

| Supply Category | Description |
|---|---|
| `RESELL_PRODUCT` | Products for resale by franchises |
| `PACKAGING` | Packaging materials |
| `EQUIPMENT` | Business equipment |
| `MARKETING` | Marketing materials |

When `isAvailableForFranchiseSupply` is `true`, franchises can include this product in their supply requests.

---

## File References

### Backend

| File | Purpose |
|---|---|
| `backend/models/product.model.js` | Product schema with all fields |
| `backend/controllers/product.controller.js` | Product CRUD and listing |
| `backend/routes/product.routes.js` | Product route definitions |
| `backend/config/cacheRedis.js` | Redis cache middleware |
| `backend/services/storage.service.js` | Cloudinary upload service |
| `backend/products.seed.js` | Product seeder script |

### Frontend

| File | Purpose |
|---|---|
| `Frontend/src/features/products/pages/ProductDetails.jsx` | Product details page |
| `Frontend/src/features/products/state/getProduct.slice.js` | Product Redux slice |
| `Frontend/src/features/admin/pages/CreateProduct.jsx` | Admin product creation form |
| `Frontend/src/features/admin/state/product.slice.js` | Product creation Redux slice |
| `Frontend/src/components/ProductSlider.jsx` | Homepage product carousel |
