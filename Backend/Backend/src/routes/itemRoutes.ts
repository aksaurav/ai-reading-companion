// backend/src/routes/itemRoutes.ts
import { Router } from "express";
import { createItem, getItems } from "../controllers/itemController.js";

const router = Router();

router.post("/", createItem);
router.get("/", getItems);

export default router;
