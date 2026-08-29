import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// 1. Updated FRANCHISE_TYPES with 'CITY' tier benefits
export const FRANCHISE_TYPES = {
  VILLAGE: { type: "VILLAGE", price: 150000, roi: 5000, rent: 0, commPerProduct: 500 },
  CITY: { type: "CITY", price: 400000, roi: 12000, rent: 5000, commPercent: 1.8, commPerProduct: 500 }, 
  DISTRICT: { type: "DISTRICT", price: 750000, roi: 22500, rent: 10000, commPercent: 2, commPerProduct: 500 },
  STATE: { type: "STATE", price: 15000000, roiPercent: 0, rent: 450000, commPercent: 1.5 }
};

const franchiseSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true, trim: true },
    franchiseType: {
      type: String,
      enum: ["VILLAGE", "CITY", "DISTRICT", "STATE"], // 👈 Added "CITY" in enum validation
      required: true
    },
    // Relational Parent Link for Hierarchy (Village/City belongs to District, District to State)
    parentFranchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      default: null,
      index: true
    },
    address: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String }, // 👈 Optional field added for city name
      taluka: { type: String },
      village: { type: String }
    },

    // Business & Compliance Documentation
    udyamNumber: { type: String, required: true },
    firmDocsUrl: { type: String, required: true },
    shopLicenseUrl: { type: String, required: true },
    panNumber: { type: String, required: true, uppercase: true, trim: true },
    panCardImageUrl: { type: String, required: true },
    aadhaarNumber: { type: String, required: true, trim: true },
    aadhaarCardImageUrl: { type: String, required: true },

    // Financial & Bank Info
    bankDetails: {
      accountHolder: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true, uppercase: true, trim: true }
    },

    // Status & Complete Wallet Metrics
    status: {
      type: String,
      enum: ["Pending", "Active", "Blocked", "Rejected"],
      default: "Pending"
    },
    wallet: {
      balance: { type: Number, default: 0, min: 0 },
      totalEarnings: { type: Number, default: 0 },
      pendingRent: { type: Number, default: 0 },
      pendingRoi: { type: Number, default: 0 },
      totalCommission: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Hash password before saving
franchiseSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
franchiseSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const franchiseModel = mongoose.models.Franchise || mongoose.model("Franchise", franchiseSchema);
export default franchiseModel;