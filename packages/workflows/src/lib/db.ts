import { eq, sql } from "drizzle-orm";
import { schema } from "@packages/db";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const neonSqlClient = neon(process.env.DATABASE_URL!);
export { eq, schema, sql };

export const db = drizzle({
  client: neonSqlClient,
  casing: "snake_case",
  schema,
});
