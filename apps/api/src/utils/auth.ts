import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "../lib/db.js";

const parseOrigins = (value?: string) =>
  value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const authBaseURL = process.env.BETTER_AUTH_URL;
const trustedOrigins = parseOrigins(process.env.CORS_ORIGIN);
const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN;

export const auth = betterAuth({
  baseURL: authBaseURL,
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
    crossSubDomainCookies: {
      enabled: Boolean(cookieDomain),
      domain: cookieDomain,
    },
  },
  usePlural: true,
  user: {
    fields: {
      image: "avatarUrl",
    },
    deleteUser: {
      enabled: true,
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
  trustedOrigins,
});
