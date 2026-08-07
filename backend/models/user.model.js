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
      enum: ["Admin", "Agent"], 
      default: "Agent"
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    position:{
        type:String,
        enum:["left","right",null],
        default:null        
    },

    agentName:{
      type: String,
      required: true
    },

    agentId:{
      type: String,
      required: true,
      
    },

  

    //   parentAgentId: {
    //    type: mongoose.Schema.Types.ObjectId,     for payments 
    //  ref: "user", 
    //  default: null
    //  },
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