import "dotenv/config";
import "./utils/instrumentation.ts";
import { app } from "./app.ts";
import { ApiLogger as logger } from "@packages/shared";

const PORT = Number(process.env.PORT ?? 4000);

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
