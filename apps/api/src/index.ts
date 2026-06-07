import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.js";
import cors from "cors"

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}))
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
