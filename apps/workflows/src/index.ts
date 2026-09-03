import "dotenv/config";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/index.js";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
