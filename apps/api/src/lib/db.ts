import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import { schema } from "@packages/db";
import { eq, sql } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

// 1. Production Mode: Serverless Neon via HTTP
const createProductionDb = () => {
  const client = neon(databaseUrl);
  return drizzleNeon(client);
};

// 2. Development Mode: Local Docker Container via TCP
const createDevelopmentDb = () => {
  const pool = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 5,
    connect_timeout: 5,
  });
  return drizzlePg(pool);
};

// Export a single database instance that changes based on your environment.
// Cast to a single concrete driver type so chained query builders keep working
// overload resolution (a raw union of two driver types breaks .returning()).
type Database = ReturnType<typeof createProductionDb>;

export const db = (
  process.env.NODE_ENV === "production"
    ? createProductionDb()
    : createDevelopmentDb()
) as Database;

export { schema, eq, sql };
