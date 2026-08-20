import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // --- 1. Basic Product Details ---
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    shortDescription: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "Generic",
    },

    // --- 2. Pricing & MLM Financials (Most Important for MLM) ---
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: 0,
    },
    price: {
      type: Number,
      required: [true, "Selling Price (DP - Distributor Price) is required"],
      min: 0,
    }, // Distributor / Member Price
    bv: {
      type: Number,
      required: [true, "Business Volume (BV) is required"],
      default: 0,
      min: 0,
    }, // Binary Matching / Downline BV Calculation ke liye
    pv: {
      type: Number,
      default: 0,
      min: 0,
    }, // Point Value (Agar Rank Advancement me use hota hai)
    directCommission: {
      type: Number,
      default: 0,
      min: 0,
    }, // Specific product purchase par Sponsor ko kitna direct bonus milega

    // --- 3. Inventory & Stock Management ---
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: 0,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // --- 4. Product Media ---
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: "" }, // Cloudinary / S3 Image ID
      },
    ],

    // --- 5. MLM Specific Configuration ---
    isActivationPackage: {
      type: Boolean,
      default: false,
    }, // Kya is product ko buy karke new user ID activate ho sakti hai?
    
    packageTier: {
      type: String,
      enum: ["None", "Starter", "Bronze", "Silver", "Gold", "Diamond"],
      default: "None",
    }, // Product buy karne par konsi ID rank/package assigned hogi

    // --- 6. Admin Control & Status ---
    isActive: {
      type: Boolean,
      default: true,
    },
    gstPercentage: {
      type: Number,
      default: 18, // GST Tax Rate
    },
      category: {
       type: String,
       required: [true, "Category is required"],
        trim: true,
       enum: {
        values: [
        "BEST SELLERS",
        "FEATURED COLLECTION",
        "EXECUTIVE BUNDLES",
        "NEW ARRIVALS",
       ],
        message: "{VALUE} is not a valid product category", // Custom error message
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Slug creation pre-save middleware
productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }
  ;
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;