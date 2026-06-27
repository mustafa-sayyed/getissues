import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "@packages/db";

export { eq, schema, sql };

export const db = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
  schema,
});
