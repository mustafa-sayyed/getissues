import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { account, session, user, verification } from "./schema/user.model.js";

export const db = drizzle(process.env.DATABASE_URL!, {
  casing: "snake_case",
});

export const schema = {
  user,
  session,
  account,
  verification,
};
