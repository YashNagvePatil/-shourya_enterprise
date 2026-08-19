import productDao from "../dao/product.dao.js";
import { uploadMultipleToCloudinary } from "../services/storage.service.js";

// ==========================================
// Create Product Controller (With Detailed Debug Logging)
// ==========================================

export const createProduct = async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n========================================`);
  console.log(`[${timestamp}] 🚀 [CREATE PRODUCT INITIATED]`);
  console.log(`[DEBUG] Route Path: ${req.originalUrl}`);
  console.log(`[DEBUG] Authenticated User:`, req.user ? { id: req.user._id, role: req.user.role } : "None");
  console.log(`[DEBUG] Received req.body keys:`, Object.keys(req.body || {}));

  try {
    const {
      name,
      sku,
      description,
      shortDescription,
      category,
      brand,
      mrp,
      price,
      bv,
      pv,
      directCommission,
      stock,
      isActivationPackage,
      packageTier,
      gstPercentage,
      images,
    } = req.body;

    // ------------------------------------------
    // 1. Mandatory Validations Check
    // ------------------------------------------
    console.log(`[DEBUG] Step 1: Validating mandatory fields...`);
    if (!name || !sku || !description || !category || mrp === undefined || price === undefined) {
      const missingFields = [];
      if (!name) missingFields.push("name");
      if (!sku) missingFields.push("sku");
      if (!description) missingFields.push("description");
      if (!category) missingFields.push("category");
      if (mrp === undefined) missingFields.push("mrp");
      if (price === undefined) missingFields.push("price");

      console.warn(`[DEBUG VALIDATION FAILED] Missing required fields:`, missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // ------------------------------------------
    // 2. Parse & Validate Numeric Pricing
    // ------------------------------------------
    console.log(`[DEBUG] Step 2: Parsing pricing numbers (MRP: ${mrp}, Price: ${price})...`);
    const parsedMrp = Number(mrp);
    const parsedPrice = Number(price);

    if (isNaN(parsedMrp) || isNaN(parsedPrice)) {
      console.warn(`[DEBUG VALIDATION FAILED] Non-numeric pricing provided. Parsed MRP: ${parsedMrp}, Parsed Price: ${parsedPrice}`);
      return res.status(400).json({
        success: false,
        message: "MRP and Price must be valid numbers",
      });
    }

    if (parsedPrice > parsedMrp) {
      console.warn(`[DEBUG VALIDATION FAILED] Selling Price (${parsedPrice}) exceeds MRP (${parsedMrp})`);
      return res.status(400).json({
        success: false,
        message: "Selling Price (DP) cannot be greater than MRP Rate",
      });
    }

    // ------------------------------------------
    // 3. Unique SKU Check
    // ------------------------------------------
    const formattedSku = sku.toUpperCase().trim();
    console.log(`[DEBUG] Step 3: Checking database for unique SKU '${formattedSku}'...`);
    
    const existingProduct = await productDao.findBySku(formattedSku);
    if (existingProduct) {
      console.warn(`[DEBUG VALIDATION FAILED] Duplicate SKU found: '${formattedSku}'`);
      return res.status(400).json({
        success: false,
        message: `Product SKU '${formattedSku}' already exists. SKU must be unique.`,
      });
    }

    // ------------------------------------------
    // 4. Handle Base64 Uploads to Cloudinary
    // ------------------------------------------
    let uploadedImages = [];
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`[DEBUG] Step 4: Processing ${images.length} image(s) for Cloudinary...`);

      if (images.length > 5) {
        console.warn(`[DEBUG VALIDATION FAILED] Image count (${images.length}) exceeds 5 limit.`);
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 5 images per product.",
        });
      }

      // Log type and string size of first item for Base64 format verification
      console.log(`[DEBUG] Sample image data type: ${typeof images[0]}, String length: ${images[0]?.length || 0}`);
      
      try {
        uploadedImages = await uploadMultipleToCloudinary(images, "mlm_products");
        console.log(`[DEBUG] Cloudinary Upload Success. Received ${uploadedImages.length} image objects.`);
      } catch (cloudinaryErr) {
        console.error(`❌ [CLOUDINARY UPLOAD ERROR]:`, cloudinaryErr.message);
        return res.status(500).json({
          success: false,
          message: "Failed to upload images to Cloudinary",
          error: cloudinaryErr.message,
        });
      }
    } else {
      console.log(`[DEBUG] Step 4: No images provided in request body.`);
    }

    // ------------------------------------------
    // 5. Pre-Calculated Fields & Payload Assembly
    // ------------------------------------------
    console.log(`[DEBUG] Step 5: Assembling database payload...`);
    const discountAmount = parsedMrp - parsedPrice;
    const discountPercentage = parsedMrp > 0 ? Math.round((discountAmount / parsedMrp) * 100) : 0;

    const productPayload = {
      name: name.trim(),
      sku: formattedSku,
      description,
      shortDescription: shortDescription || "",
      category: category.trim(),
      brand: brand || "Generic",
      mrp: parsedMrp,
      price: parsedPrice,
      bv: Number(bv || 0),
      pv: Number(pv || 0),
      directCommission: Number(directCommission || 0),
      stock: Number(stock || 0),
      images: uploadedImages,
      isActivationPackage: isActivationPackage === "true" || isActivationPackage === true,
      packageTier: packageTier || "None",
      gstPercentage: Number(gstPercentage || 18),
    };

    console.log(`[DEBUG] Payload assembled:`, JSON.stringify(productPayload, null, 2));

    // ------------------------------------------
    // 6. Save Product via DAO
    // ------------------------------------------
    console.log(`[DEBUG] Step 6: Persisting product to Mongo Database via DAO...`);
    const newProduct = await productDao.createProduct(productPayload);
    console.log(`✅ [PRODUCT CREATED SUCCESS] ID: ${newProduct._id}`);

    // ------------------------------------------
    // 7. Success Response
    // ------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Product created successfully with Cloudinary images!",
      meta: {
        discountAmount,
        discountPercentage: `${discountPercentage}%`,
      },
      data: newProduct,
    });
  } catch (error) {
    // ------------------------------------------
    // Detailed Error Catch & Categorization
    // ------------------------------------------
    console.error(`\n❌ [CREATE PRODUCT CATCH ERROR LOGGED]`);
    console.error(`[ERROR NAME]:`, error.name);
    console.error(`[ERROR MESSAGE]:`, error.message);
    console.error(`[STACK TRACE]:\n`, error.stack);

    // Mongoose Validation Error (e.g. schema types or min/max constraints fail)
    if (error.name === "ValidationError") {
      const mongooseErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Database Validation Failed",
        errors: mongooseErrors,
      });
    }

    // Mongo Duplicate Key Error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate field value entered in database",
        duplicateFields: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Product Creation Failed",
      debugInfo: {
        errorName: error.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};