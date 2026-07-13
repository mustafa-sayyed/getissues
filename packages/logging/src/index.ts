import { pino } from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: {
    target: isProduction ? "pino-pretty" : "",
    options: {
      colorize: !isProduction,
    },
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
});

export const ApiLogger = logger.child({ module: "api" });
export const WorkflowLogger = logger.child({ module: "workflow" });
