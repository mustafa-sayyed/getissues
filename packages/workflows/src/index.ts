import "dotenv/config";
import { db, schema } from "@packages/db";
import { task } from "@renderinc/sdk/workflows";
import { eq } from "drizzle-orm";

const connection = await db.execute("SELECT 1");
const users = await db.select().from(schema.user);

console.log("Connection: ", connection);
console.log("Users: ", users);

await import("./tasks.js");

const getUserfromDB = task(
  {
    name: "getUserfromDB",
  },
  async (email: string) => {
    try {
      const res = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.email, email));
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);

// write render task to fetch issue sfrom github using octokit
const fetchIssuesFromGithub = task(
  {
    name: "fetchIssuesFromGithub",
  },
  async (owner: string, repo: string) => {
    try {
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });
      const issues = await octokit.rest.issues.listForRepo({
        owner,
        repo,
      });
      return issues.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
);
