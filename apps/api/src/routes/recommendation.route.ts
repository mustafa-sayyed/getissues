import express from "express";
import {
  getRecommendation,
  getRecommendations,
  getRecommendationStats,
  updateRecommendationFeedback,
  updateRecommendationStatus,
} from "../controllers/recommendation.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.ts";
import {
  recommendationIdParam,
  recommendationsQuerySchema,
  updateRecommendationFeedbackSchema,
  updateRecommendationStatusSchema,
} from "../validations/recommendation.validation.ts";

const router = express.Router();

router.get("/stats", requireAuth, getRecommendationStats);
router.get(
  "/:recommendationId",
  requireAuth,
  validateParams(recommendationIdParam),
  getRecommendation,
);
router.patch(
  "/:recommendationId/status",
  requireAuth,
  validateParams(recommendationIdParam),
  validateBody(updateRecommendationStatusSchema),
  updateRecommendationStatus,
);
router.patch(
  "/:recommendationId/feedback",
  requireAuth,
  validateParams(recommendationIdParam),
  validateBody(updateRecommendationFeedbackSchema),
  updateRecommendationFeedback,
);
router.get(
  "/",
  requireAuth,
  validateQuery(recommendationsQuerySchema),
  getRecommendations,
);

export default router;
