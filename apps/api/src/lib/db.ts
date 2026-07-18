import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "@packages/db";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, {
  connect_timeout: 10,
  idle_timeout: 60,
  backoff: true,
  max: 20,
});

export const db = drizzle({
  client,
  schema,
  casing: "snake_case",
});

export { schema, eq, sql };