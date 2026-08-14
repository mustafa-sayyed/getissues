import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.ts";
import cors from "cors";
import userRouter from "./routes/user.route.ts";
import issueRouter from "./routes/issue.route.ts";
import recommendationRouter from "./routes/recommendation.route.ts";
import agentRunRouter from "./routes/agentRun.route.ts";
import agentConfigRouter from "./routes/agentConfig.route.ts";
import globalErrorHandler from "./middlewares/errorHandler.middleware.ts";
import { pinoHttp } from "pino-http";

const app = express();
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

app.use(pinoHttp({ quietReqLogger: true, quietResLogger: true }));

app.all("/api/v1/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/issues", issueRouter);
app.use("/api/v1/recommendations", recommendationRouter);
app.use("/api/v1/agent-runs", agentRunRouter);
app.use("/api/v1/agent-config", agentConfigRouter);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});


// Global Error Handler
app.use(globalErrorHandler);

export { app };
