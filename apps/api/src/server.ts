import "dotenv/config";
import "./utils/instrumentation.js";
import { Render } from "@renderinc/sdk";
import { app } from "./app.js";
import { ApiLogger as logger } from "@packages/logging";
import { db, schema } from "./lib/db.js";
import cron from "node-cron";

const PORT = Number(process.env.PORT ?? 4000);
const render = new Render();

// Setup Cron Jobs
// Workflow 1: Issues Ingestion (runs every 2 hours)
cron.schedule("0 */2 * * *", async () => {
  logger.info("Triggering ingestIssuesWorkflow via cron...");
  try {
    const ingestIssuesWorkflows = await render.workflows.startTask(
      "getissues-workflows/ingestIssuesWorkflow",
      [],
    );
    logger.info(
      { ingestWorkflowTaskId: ingestIssuesWorkflows.taskRunId },
      "[ingestIssuesWorkflow] task started:",
    );
  } catch (err) {
    logger.error(err, "Cron Error (ingestIssuesWorkflow):");
  }
});

// Workflow 2: User Specific Agent Runs
// To keep it simple, we run it every 4 hours
cron.schedule("0 */4 * * *", async () => {
  logger.info("Triggering userAgentRunsWorkflow via cron...");
  try {
    const users = await db.select().from(schema.user);
    for (const user of users) {
      try {
        const userAgentWorkflow = await render.workflows.startTask(
          "getissues-workflows/userAgentRunsWorkflow",
          [user.id],
        );
        logger.info(
          {
            taskRunId: userAgentWorkflow.taskRunId,
            userId: user.id,
          },
          "[userAgentWorkflow] task started",
        );
      } catch (error) {
        logger.error(
          { error, userId: user.id },
          `Error running userAgentRunsWorkflow for user ${user.id}:`,
        );
      }
    }
  } catch (err) {
    logger.error(err, "Cron Error (userAgentRunsWorkflow):");
  }
});

// Start the Server
app.listen(PORT, () => {
  logger.info(`API listening on port ${PORT}`);
});

process.on("SIGINT", async () => {
  logger.info(
    {
      signal: "SIGINT",
      timestamp: new Date().toISOString(),
    },
    "Shutting down gracefully...",
  );
  await db.$client.end();
});

process.on("SIGTERM", async () => {
  logger.info(
    {
      signal: "SIGTERM",
      timestamp: new Date().toISOString(),
    },
    "Shutting down gracefully...",
  );
  await db.$client.end();
});
