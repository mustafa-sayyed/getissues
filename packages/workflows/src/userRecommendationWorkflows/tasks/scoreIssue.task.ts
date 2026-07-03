import { task } from "@renderinc/sdk/workflows";
import z from "zod";
import { issue, IssueEvaluation } from "../../types/common.types.js";
import { scoringAgent } from "../../lib/agent.js";

const EvaluationSchema = z.object({
  evaluations: z.array(
    z.object({
      issueId: z.string(),
      score: z.number().min(0).max(1),
      reason: z.string(),
    }),
  ),
});

export const scoreIssueTask = task(
  { name: "scoreIssueTask", plan: "starter" },
  async (
    issues: issue[],
    userSkillsText: string,
  ): Promise<IssueEvaluation[]> => {
    const issuesList = issues
      .map(
        (issue, idx) =>
          `Issue ${idx + 1}:
           ID: ${issue.id}
           Title: ${issue.title}
           Description: ${issue.body?.slice(0, 200) ?? "(no description provided)"}`,
      )
      .join("\n\n");

    const prompt = `
        Developer skills:
        ${userSkillsText}

        Evaluate the following ${issues.length} GitHub issue(s) for this developer:

        ${issuesList}

        Return a structured evaluation for EVERY issue. Use the exact issue ID provided.
            `.trim();

    const result = await scoringAgent.generate(prompt, {
      structuredOutput: {
        schema: EvaluationSchema,
      },
    });

    const evaluations = result.object.evaluations;

    // Safety net: if agent missed any issue, assign neutral score
    const evaluatedIds = new Set(evaluations.map((e) => e.issueId));
    for (const issue of issues) {
      if (!evaluatedIds.has(issue.id)) {
        console.warn(
          `Agent missed issue ${issue.id} — assigning neutral score`,
        );
        evaluations.push({
          issueId: issue.id,
          score: 0.5,
          reason: "Could not be evaluated — assigned neutral score",
        });
      }
    }

    evaluations.forEach((e) =>
      console.log(
        `Issue ${e.issueId} → score: ${e.score} | ${e.reason}`,
      ),
    );

    return evaluations;
  },
);
