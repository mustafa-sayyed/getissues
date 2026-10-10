import express from "express";
import {
  getGithubUserData,
  getOnboardingProfile,
  getUserSkills,
  getUserPreferences,
  createUserSkills,
  updateUserSkills,
  updateUserPreferences,
  deleteAccount,
} from "../controllers/user.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import {
  createUserSkillsSchema,
  updateUserSkillsSchema,
  updateUserPreferencesSchema,
} from "../validations/user.validation.ts";

const router = express.Router();

router.get("/skills", requireAuth, getUserSkills);
router.get("/onboarding-profile", requireAuth, getOnboardingProfile);
router.get("/preferences", requireAuth, getUserPreferences);
router.patch(
  "/preferences",
  requireAuth,
  validate(updateUserPreferencesSchema),
  updateUserPreferences,
);
router.post(
  "/skills",
  requireAuth,
  validate(createUserSkillsSchema),
  createUserSkills,
);
router.put(
  "/skills",
  requireAuth,
  validate(updateUserSkillsSchema),
  updateUserSkills,
);
router.delete("/account", requireAuth, deleteAccount);
router.get("/github/:userId", requireAuth, getGithubUserData);

export default router;
