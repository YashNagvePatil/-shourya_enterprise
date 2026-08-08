import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // --- Basic Information ---
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contact: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Agent"], default: "Agent" },

    // --- Membership & Identity ---
    distributerId: { type: String, required: true, unique: true }, // e.g. AGT1001

    // --- Account Status & Activation ---
    status: { type: String, enum: ["Pending", "Active", "Blocked"], default: "Pending" },
    isActivated: { type: Boolean, default: false }, // Product purchase par true hoga
    activationDate: { type: Date, default: null },

    // --- Binary Tree Structure ---
    position: { type: String, enum: ["left", "right", null], default: null },
    parentAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    parrentAgentName: { type: String, default: "System" },
    sponserId: { type: String, default: "DIRECT" },
    sponserName: { type: String, default: "System" },

    // --- BV Points & Counters ---
    leftBV: { type: Number, default: 0 },         // Current balance for matching
    rightBV: { type: Number, default: 0 },        // Current balance for matching
    totalLeftBV: { type: Number, default: 0 },    // Lifetime accumulated
    totalRightBV: { type: Number, default: 0 },   // Lifetime accumulated

    // --- Financials & Wallet ---
    walletBalance: { type: Number, default: 0 },
    totalMatchingBonus: { type: Number, default: 0 },
    totalDirectBonus: { type: Number, default: 0 },

    // --- KYC Details ---
    panCardNumber: { type: String, uppercase: true, trim: true, unique: true, sparse: true, default: null },
    adharCardNumber: { type: String, trim: true, unique: true, sparse: true, default: null },
    kycStatus: { type: String, enum: ["Not_Submitted", "Pending", "Approved", "Rejected"], default: "Pending" },

    // --- Bank Details for Withdrawals (Agent Dashboard se badme fill hoga) ---
    bankDetails: {
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
      upiId: { type: String, default: "" }
    },

    // --- Address for Product Shipping ---
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

// Password Hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;