import { Router } from "express";
import { getAllProducts, getProductDetails } from "../controllers/product.controller.js";
import { cacheMiddleware } from "../config/cacheRedis.js";

const router = Router();

/**
 * @desc Get all products (with optional filtering & pagination)
 * @route GET /api/home
 * @access Public
 */
router.get("/", cacheMiddleware(300, "products"), getAllProducts);

/**
 * @desc Get product details & related products from same category
 * @route GET /api/home/:id
 * @access Public
 */
router.get("/:id", cacheMiddleware(300, "products"), getProductDetails);

export default router;