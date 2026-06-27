import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "../lib/db.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      verification: schema.verification,
      account: schema.account,
      session: schema.session,
      user: schema.user,
    },
  }),
  advanced: {
    database: {
      generateId: false,
    },
    cookiePrefix: "getissues",
  },
  usePlural: true,
  user: {
    fields: {
      image: "avatarUrl",
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => ({
        avatarUrl: profile.avatar_url,
      }),
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN as string],
});
