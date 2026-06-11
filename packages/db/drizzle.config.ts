import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema",
  out: "./drizzle",
  dbCredentials: {
    // for migration using non-pooled postgres connection
    url: process.env.MIGRATION_DATABASE_URL!,
  },
});
