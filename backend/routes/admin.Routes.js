import { Router } from "express";
import { getAllagentsData } from "../controllers/admin.controller";

const router = Router()

  router.get("/dashboard",getAllagentsData)

export default router