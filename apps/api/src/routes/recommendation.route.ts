import express from "express";
import { getRecommendations } from "../controllers/recommendation.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getRecommendations);

export default router;
