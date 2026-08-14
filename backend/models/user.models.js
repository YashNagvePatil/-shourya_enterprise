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
    rank: { type: String, default: "Distributor" }, // e.g. "Distributor", "Bronze", "Silver", "Gold"

    // --- Account Status & Activation ---
    status: { type: String, enum: ["Pending", "Active", "Blocked"], default: "Pending" },
    isActivated: { type: Boolean, default: false }, //true when product pusrhased
    activationDate: { type: Date, default: null },
    packageAmount: { type: Number, default: 0 },   // package amount for activation 

    // --- Binary Tree Structure (Pointers) ---
    position: { type: String, enum: ["left", "right", null], default: null },
    parentAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    parrentAgentName: { type: String, default: "System" },
    sponserId: { type: String, default: "DIRECT" },
    sponserName: { type: String, default: "System" },

    //  NEW: Direct Child Nodes (Binary Tree Nodes)
    leftChild: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null,index: true },
    rightChild: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null,index: true },

    //  NEW: Team & Downline Counters (For Quick Dashboard Display)
    totalDirects:{ type: Number, default: 0 },         // Direct Referral Count
    totalLeftAgents: { type: Number, default: 0 },      // Total Downline Agents in Left Leg
    totalRightAgents: { type: Number, default: 0 },     // Total Downline Agents in Right Leg
    activeLeftAgents: { type: Number, default: 0 },     // Active Agents in Left Leg
    activeRightAgents: { type: Number, default: 0 },    // Active Agents in Right Leg

    // --- BV Points & Business Counters ---
    leftBV: { type: Number, default: 0 },        // Current balance BV for matching
    rightBV: { type: Number, default: 0 },       // Current balance BV for matching
    totalLeftBV: { type: Number, default: 0 },   // Lifetime accumulated BV
    totalRightBV: { type: Number, default: 0 },  // Lifetime accumulated BV

    // --- Financials, Wallet & Payout Stats ---
    walletBalance: { type: Number, default: 0 },        // Current withdrawable balance
    totalMatchingBonus: { type: Number, default: 0 },   // Total Binary Matching Earning
    totalDirectBonus: { type: Number, default: 0 },     // Total Direct Sponsor Earning
    totalEarning: { type: Number, default: 0 },         // Lifetime Total Earning
    totalWithdrawn: { type: Number, default: 0 },       // Total Amount Payout Released
    pendingPayout: { type: Number, default: 0 },        // Requested for Withdrawal
    
    // --- KYC Details ---
    panCardNumber: { type: String, uppercase: true, trim: true, unique: true, sparse: true, default: null },
    adharCardNumber: { type: String, trim: true, unique: true, sparse: true, default: null },
    kycStatus: { type: String, enum: ["Not_Submitted", "Pending", "Approved", "Rejected"], default: "Pending" },

    // --- Bank Details for Withdrawals ---
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

// Password Hashing Pre-save Hook
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password Method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);
export default userModel;