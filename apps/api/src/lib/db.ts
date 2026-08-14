import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { schema } from "@packages/db";
import { eq, sql } from "drizzle-orm";

const client = neon(process.env.DATABASE_URL!);

export const db = drizzle({ client: client });

export { schema, eq, sql };
