import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "@packages/db";
import { count, eq, sql, desc } from "drizzle-orm";

const neonSqlClient = neon(process.env.DATABASE_URL!);

export { count, eq, sql, desc, schema };

export const db = drizzle({
  client: neonSqlClient,
  casing: "snake_case",
  schema,
});
