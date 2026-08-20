import { Router } from "express";
import { getAllProducts, getProductDetails } from "../controllers/product.controller.js";


const router = Router()


/**
 * @desc Get all products(with optioanal filtering & pagination)
 * @route GET /api/home
 * @access Public
 */

router.get("/",getAllProducts)

/**
 *  @desc  Get product details & related products from same category
 * @route  GET /api/home/:id
 * @access Public
 */

router.get("/:id",getProductDetails)

export default router