import express from "express";
import {
  getRecommendation,
  getRecommendations,
  getRecommendationStats,
  updateRecommendationStatus,
} from "../controllers/recommendation.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = express.Router();

router.get("/stats", requireAuth, getRecommendationStats);
router.get("/:recommendationId", requireAuth, getRecommendation);
router.patch(
  "/:recommendationId/status",
  requireAuth,
  updateRecommendationStatus,
);
router.get("/", requireAuth, getRecommendations);

export default router;
