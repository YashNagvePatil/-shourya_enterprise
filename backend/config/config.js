import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not declared");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not declared");
if (!process.env.CLOUDYNARY_API_KEY) throw new Error("CLOUDYNARY_API_KEY is not declared");
if (!process.env.CLOUDYNARY_API_SECRET) throw new Error("CLOUDYNARY_API_SECRET is not declared");
if (!process.env.CLOUDYNARY_CLOUD_NAME) throw new Error("CLOUDYNARY_CLOUD_NAME is not declared");
if (!process.env.RAZORPAY_KEY_SECRET) throw new Error("RAZORPAY_KEY_SECRET is not declared");
if (!process.env.RAZORPAY_TEST_API_KEY) throw new Error("RAZORPAY_TEST_API_KEY is not declared");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDYNARY_CLOUD_NAME,
  api_key: process.env.CLOUDYNARY_API_KEY,
  api_secret: process.env.CLOUDYNARY_API_SECRET,
});

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLOUDYNARY_API_KEY: process.env.CLOUDYNARY_API_KEY,
  CLOUDYNARY_API_SECRET: process.env.CLOUDYNARY_API_SECRET,
  CLOUDYNARY_CLOUD_NAME: process.env.CLOUDYNARY_CLOUD_NAME,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_TEST_API_KEY: process.env.RAZORPAY_TEST_API_KEY,
};

export default cloudinary;