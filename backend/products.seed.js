import mongoose from 'mongoose';
import productModel from './models/product.model.js';
import { config } from './config/config.js';

const DUMMY_IMAGE_URL = {
  url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
  public_id: "dummy_public_id"
};

const categories = [
  "FEATURED COLLECTION",
  "BEST SELLERS",
  "EXECUTIVE BUNDLES",
  "NEW ARRIVALS"
];

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate unique URL slug
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateproductModelsForCategory = (categoryName, indexOffset) => {
  const productModels = [];

  for (let i = 1; i <= 10; i++) {
    const idNum = indexOffset + i;
    const idStr = String(idNum).padStart(3, '0');
    const mrp = getRandomNumber(1500, 10000);
    const price = Math.floor(mrp * (getRandomNumber(70, 95) / 100));
    const isPackage = categoryName === "EXECUTIVE BUNDLES";
    
    const productModelName = `Luxury Formulation ${idStr} - ${categoryName}`;
    const productModelSlug = `${slugify(productModelName)}-${idNum}`;

    productModels.push({
      name: productModelName,
      slug: productModelSlug,
      sku: `LUX-${categoryName.substring(0, 3).toUpperCase()}-${idStr}`,
      description: `This is an exclusive luxury formulation part of our ${categoryName}. It features premium ingredients designed for maximum efficacy. Highly recommended for premium tier members.`,
      shortDescription: `Premium ${categoryName.toLowerCase()} productModel for superior wellness.`,
      category: categoryName,
      brand: "LUXE ESSENTIALS",
      mrp: mrp,
      price: price,
      bv: getRandomNumber(10, 50),
      pv: getRandomNumber(5, 25),
      directCommission: getRandomNumber(100, 500),
      stock: getRandomNumber(20, 200),
      isActivationPackage: isPackage,
      packageTier: isPackage ? "Gold" : "None",
      gstPercentage: 18,
      isActive: true,
      isAvailable: true,
      images: [DUMMY_IMAGE_URL],
    });
  }

  return productModels;
};

const seedproductModelModels = async () => {
  try {
    console.log("========================================");
    console.log("🚀 [SEED INITIATED] Connecting to Database...");

    await mongoose.connect(config.MONGO_URI);
    console.log("✅ Database Connected Successfully.");

    console.log("🗑️ Clearing existing productModels...");
    await productModel.deleteMany({});
    console.log("✅ Existing productModels cleared.");

    let allproductModels = [];
    categories.forEach((category, index) => {
      const categoryproductModels = generateproductModelsForCategory(category, index * 10);
      allproductModels = [...allproductModels, ...categoryproductModels];
    });

    console.log(`⏳ Seeding ${allproductModels.length} productModels to database...`);
    const insertedData = await productModel.insertMany(allproductModels);

    console.log(`✅ [SEED SUCCESS] ${insertedData.length} productModels successfully inserted.`);
    console.log("========================================");

    await mongoose.disconnect();
    console.log("🔌 Database Disconnected.");
    process.exit(0);

  } catch (error) {
    console.error("❌ [SEED FAILED]:", error.message);
    process.exit(1);
  }
};

seedproductModelModels();