// backend/src/routes/aiRoutes.ts
import { Router } from "express";
import {
  embedItem,
  discussItem,
  generateQuiz,
} from "../controllers/aiController.js";

const router = Router();

router.post("/:itemId/embed", embedItem);
router.post("/:itemId/discuss", discussItem);
router.get("/:itemId/quiz", generateQuiz);

export default router;
