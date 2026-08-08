import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    contact: {
      type: Number,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["Admin", "Agent"],
      default: "Agent"
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    // Controller  distributerId (e.g., AGT452136)
    distributerId: {
      type: String,
      required: true,
      unique: true
    },

    position: {
      type: String,
      enum: ["left", "right", null],
      default: null
    },

    // Tree & Sponsor Tracking Fields
    parentAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null
    },

    parrentAgentName: {
      type: String,
      default: "System"
    },

    sponserId: {
      type: String,
      default: "DIRECT"
    },

    sponserName: {
      type: String,
      default: "System"
    },

    // KYC Information (Sparse unique to prevent null duplicate errors)
    panCardNumber: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      sparse: true,
      default: null
    },

    adharCardNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: null
    }
  },
  { timestamps: true }
);

// --- Password Hashing Middleware ---
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

// --- Password Compare Method ---
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;