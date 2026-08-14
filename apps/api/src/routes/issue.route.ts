import express from "express";
import { getIssues } from "../controllers/issue.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";

const router = express.Router();

router.get("/", requireAuth, getIssues);

export default router;
