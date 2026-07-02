import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import issueRouter from "./routes/issue.route.js";
import recommendationRouter from "./routes/recommendation.route.js";
import cron from "node-cron";
import { db, schema } from "./lib/db.js";
import { Render } from "@renderinc/sdk";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const render = new Render();
const corsOrigins =
  process.env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

app.all("/api/v1/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/recommendations", recommendationRouter);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

// Setup Cron Jobs
// Workflow 1: Issues Ingestion (runs every 30 mins)
cron.schedule("0 */2 * * *", async () => {
  console.log("Triggering ingestIssuesWorkflow via cron...");
  try {
    const ingestIssuesWorkflows = await render.workflows.startTask(
      "getissues-workflows/ingestIssuesWorkflow",
      [],
    );
    console.log(
      "[ingestIssuesWorkflow] task started:",
      ingestIssuesWorkflows.taskRunId,
    );

    const finishedRun = await ingestIssuesWorkflows.get();

    console.log("Task run completed:", finishedRun.id);
    console.log("Final status:", finishedRun.status);
  } catch (err) {
    console.error("Cron Error (ingestIssuesWorkflow):", err);
  }
});

// Workflow 2: User Specific Agent Runs
// To keep it simple, we run it every 2 hours and check limits inside or assume a base interval
cron.schedule("0 */4 * * *", async () => {
  console.log("Triggering userAgentRunsWorkflow via cron...");
  try {
    const users = await db.select().from(schema.user);
    for (const user of users) {
      try {
        const userAgentWorkflow = await render.workflows.startTask(
          "getissues-workflows/userAgentRunsWorkflow",
          [user.id],
        );
        console.log(
          "[userAgentWorkflow] task started:",
          userAgentWorkflow.taskRunId,
        );

        const finishedRun = await userAgentWorkflow.get();

        console.log("Task run completed:", finishedRun.id);
        console.log("Final status:", finishedRun.status);
      } catch (error) {
        console.error(
          `Error running userAgentRunsWorkflow for user ${user.id}:`,
          error,
        );
      }
    }
  } catch (err) {
    console.error("Cron Error (userAgentRunsWorkflow):", err);
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
