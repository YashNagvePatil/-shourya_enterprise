import cloudinary from "../config/config.js";

/**
 * Upload a single Base64 string or Image URL to Cloudinary
 * @param {String} base64String - Base64 data string (e.g., "data:image/jpeg;base64,...")
 * @param {String} folder - Target Cloudinary folder name
 */
export const uploadToCloudinary = async (base64String, folder = "products") => {
  try {
    if (!base64String) return null;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: "auto",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary Upload Failed: ${error.message}`);
  }
};

/**
 * Upload multiple Base64 strings concurrently to Cloudinary
 * @param {Array<String>} base64Array - Array of Base64 image strings
 * @param {String} folder - Target Cloudinary folder name
 */
export const uploadMultipleToCloudinary = async (base64Array = [], folder = "products") => {
  try {
    if (!Array.isArray(base64Array) || base64Array.length === 0) return [];

    // Process all base64 uploads in parallel
    const uploadPromises = base64Array.map((base64Item) => uploadToCloudinary(base64Item, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple Images Upload Failed: ${error.message}`);
  }
};