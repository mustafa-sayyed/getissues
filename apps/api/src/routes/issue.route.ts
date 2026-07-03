import express from "express";
import { getIssues } from "../controllers/issue.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getIssues);

export default router;
