import mongoose from "mongoose";
import adminModel from "./models/admin.model.js"; 
import { config } from "./config/config.js";


const createInitialAdmin = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("[SEED] MongoDB Connected...");

    const existingAdmin = await adminModel.findOne({ email: "admin@yourdomain.com" });
    if (existingAdmin) {
      console.log("[SEED] Admin account already exists in admins collection!");
      process.exit(0);
    }

   

    const admin = await adminModel.create({
      fullName: "Sunil dadasaheb potre",
      email: "shauryevhub27@gmail.com",
      contact: "9356959813",
      password: "Admin@#&*123",
      role: "Admin",
      status: "Active",
    });

    console.log(`[SEED] Admin created in 'admins' collection with ID: ${admin._id}`);
    process.exit(0);
  } catch (error) {
    console.error("[SEED ERROR]", error);
    process.exit(1);
  }
};

createInitialAdmin();

//for create admin use thes cmd -  node seed.admin.js