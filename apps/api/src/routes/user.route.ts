import express from "express";
import {
  getGithubUserData,
  getUserSkills,
  createUserSkills,
  updateUserSkills,
  logoutUser,
  deleteAccount,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUserSkillsSchema,
  updateUserSkillsSchema,
} from "../validations/user.validation.js";

const router = express.Router();

router.get("/skills", requireAuth, getUserSkills);
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
router.post("/logout", requireAuth, logoutUser);
router.delete("/account", requireAuth, deleteAccount);
router.get("/github/:userId", requireAuth, getGithubUserData);

export default router;
