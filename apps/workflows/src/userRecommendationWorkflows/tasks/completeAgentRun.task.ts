import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, schema, eq } from "../../lib/db.js";

export type AgentRunStatus = "success" | "failed";

/**
 * Task: Mark an agent run as completed (success or failed).
 *
 * Updates the `agent_runs` row identified by `agentRunId` with the final
 * status and the current timestamp as `ended_at`.
 *
 * Responsibility: ONE — update agent run status in DB.
 */
export const completeAgentRunTask = task(
  { name: "completeAgentRunTask", plan: "starter" },
  async (agentRunId: string, status: AgentRunStatus = "success") => {
    try {
      await db
      .update(schema.agentRuns)
      .set({ status, endedAt: new Date() })
      .where(eq(schema.agentRuns.id, agentRunId));

    logger.info(
      { agentRunId, status },
      `Agent run ${agentRunId} marked as "${status}".`,
    );

    return {
      success: true,
      agentRunId,
      status,
    };
    } catch (error) {
      logger.error(
        { error, agentRunId, status },
        `Failed to mark agent run ${agentRunId} as "${status}".`,
      );
      throw new Error(`Failed to mark agent run ${agentRunId} as "${status}".`, (error as Error));
    }
  },
);
