import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "@packages/db";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, {
  connect_timeout: 5,
  idle_timeout: 60,
  max: 10,
});

export const db = drizzle({
  client,
  schema,
  casing: "snake_case",
});

export { schema, eq, sql };