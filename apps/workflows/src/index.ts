import "dotenv/config";
import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/index.js";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// The request body limit is set to 4MB to parse larger payloads
app.use(express.json({ limit: "4mb" }));

app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
