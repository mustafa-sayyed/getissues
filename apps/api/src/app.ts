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
import compression from "compression";
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

app.use((req, res, next) => {
  // Forces Node to allow immediate event-loop termination on AWS Lambda
  res.setHeader('Connection', 'close');
  next();
});

// app.use(
//   compression({
//     filter: (req, res) => {
//       if (req.headers["x-no-compression"]) {
//         // don't compress responses if this request header is present
//         return false;
//       }

//       // fallback to standard filter function
//       return compression.filter(req, res);
//     },
//   }),
// );

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

app.use((req, res) => {
  console.log(`Express received an unhandled request for path: ${req.path}`);
  res.status(404).json({
    error: "Route not found",
    receivedPath: req.path
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export { app };
