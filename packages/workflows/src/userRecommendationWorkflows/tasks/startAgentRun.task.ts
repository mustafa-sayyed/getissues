import { task } from "@renderinc/sdk/workflows";
import { db, schema } from "../../lib/db.js";

/**
 * Task: Create an Agent Run record in the database.
 *
 * Inserts a new `agent_runs` row with status "running" and returns its ID
 * for downstream tasks to reference.
 *
 * Responsibility: ONE — create the agent run record.
 */
export const startAgentRunTask = task(
  { name: "startAgentRunTask", plan: "starter" },
  async (userId: string): Promise<string> => {
    const [agentRun] = await db
      .insert(schema.agentRuns)
      .values({ userId, status: "running" })
      .returning();

    console.log(`Agent run ${agentRun.id} started for user ${userId}.`);
    return agentRun.id;
  }
);
