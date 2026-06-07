import { betterAuth, verificationSchema } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@packages/db";

console.log(process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET);

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
  },
  usePlural: true,
  user: {
    fields: {
      image: "avatar_url",
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => ({
        avatar_url: profile.avatar_url,
      }),
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN as string],
});
