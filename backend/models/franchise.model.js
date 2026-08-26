import  bcrypt from "bcryptjs"
import  mongoose  from "mongoose"

const FRANCHISE_TYPES = {
  VILLAGE: { type: "VILLAGE", price: 150000, roi: 5000, rent: 0, commPerProduct: 500 },
  DISTRICT: { type: "DISTRICT", price: 750000, roi: 22500, rent: 10000, commPercent: 2, commPerProduct: 500 },
  STATE: { type: "STATE", price: 15000000, roiPercent: 0, rent: 450000, commPercent: 1.5 }
};


  const franchiseSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    franchiseType: {
      type: String,
      enum: ["VILLAGE", "DISTRICT", "STATE"],
      required: true
    },
    address: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      taluka: { type: String },
      village: { type: String }
    },
    // Business & Compliance Documentation
    udyamNumber: { type: String, required: true },
    firmDocsUrl: { type: String, required: true },
    shopLicenseUrl: { type: String, required: true },
    panNumber: { type: String, required: true },
    panCardImageUrl: { type: String, required: true },
    aadhaarNumber: { type: String, required: true },
    aadhaarCardImageUrl: { type: String, required: true },
    
    // Financial & Bank Info
    bankDetails: {
      accountHolder: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true }
    },
    
    // Status & Financial Metrics
    status: {
      type: String,
      enum: ["Pending", "Active", "Blocked", "Rejected"],
      default: "Pending"
    },
    wallet: {
      totalEarnings: { type: Number, default: 0 },
      pendingRent: { type: Number, default: 0 },
      pendingRoi: { type: Number, default: 0 },
      totalCommission: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

  franchiseSchema.pre("save",async function () {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,10);
  })

  franchiseSchema.methods.comparePassword = async function (password){
    bcrypt.compare(password,this.password)
  }



module.exports = {
  Franchise: mongoose.model("Franchise", franchiseSchema),
  FRANCHISE_TYPES
};