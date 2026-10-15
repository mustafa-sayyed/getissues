import serverless from "serverless-http";
import { app } from "../app.ts";

export const handler = serverless(app);