import "dotenv/config";
import "./utils/instrumentation.ts";
import { app } from "./app.ts";
import { ApiLogger as logger } from "@packages/logging";
import serverless from "serverless-http";

const PORT = Number(process.env.PORT ?? 4000);

// Start the Server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    logger.info(`API listening on port ${PORT}`);
  });
}

export const handler = serverless(app);

process.on("SIGINT", async () => {
  logger.info(
    {
      signal: "SIGINT",
      timestamp: new Date().toISOString(),
    },
    "Shutting down gracefully...",
  );
});

process.on("SIGTERM", async () => {
  logger.info(
    {
      signal: "SIGTERM",
      timestamp: new Date().toISOString(),
    },
    "Shutting down gracefully...",
  );
});
