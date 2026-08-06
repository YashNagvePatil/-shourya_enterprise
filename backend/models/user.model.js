import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,     
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
      enum: ["Distributer", "Sponser"], 
      default: "Sponser"
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    sponserName: {
      type: String,
      required: true
    },

    sponserId: {
      type: String,
      required: true,
      index: true       
    },

    distributerId: {
      type: String,
      unique: true,    
            
    }
  },
  { timestamps: true }
);


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;