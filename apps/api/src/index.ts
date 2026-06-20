import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import cors from "cors";
import userRouter from "./routes/user.route.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);


app.all("/api/v1/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

app.use("/api/v1/users", userRouter) 

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
