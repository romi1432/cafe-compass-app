import { Router } from "express";
import { recommend } from "../controllers/recommendationController";

const router = Router();

router.post("/", recommend);

export default router;
