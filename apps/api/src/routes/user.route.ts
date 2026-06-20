import express from "express";
import { getGithubUserData } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/github/:userId", getGithubUserData);

export default router;
