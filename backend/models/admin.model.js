import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contact: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "Admin" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    permissions: {
      type: [String], // e.g. ["MANAGE_USERS", "VIEW_TRANSACTIONS", "APPROVE_KYC"]
      default: ["SUPER_ADMIN"],
    },
  },
  { timestamps: true }
);

// Password Hashing Pre-save Hook
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password Method
adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("Admin", adminSchema); // Yeh automatically MongoDB mein 'admins' collection banayega