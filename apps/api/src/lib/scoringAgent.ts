import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { ApiLogger as logger } from "@packages/shared";

const scoringModels = [
  { model: "groq/openai/gpt-oss-120b", maxRetries: 2 },
  { model: "google/gemini-2.5-flash", maxRetries: 1 },
  { model: "cloudflare-workers-ai/@cf/openai/gpt-oss-120b" },
  { model: "google/gemini-3-flash-preview", maxRetries: 1 },
];

const scoringAgent = new Agent({
  id: "onboarding-scoring-agent",
  name: "Onboarding Scoring Agent",
  description:
    "Evaluates GitHub issues against a developer's skill profile with a strict quality bar.",
  instructions: `
    You are an expert open source contribution advisor. Your job is to evaluate GitHub issues
    and determine how well they match a developer's current skill set — grounded strictly in
    the issue's actual content, never inferred or assumed.

    ## STEP 0: Hard exclusion filter (apply first, before anything else)

    Reject an issue if ANY of these are true:

    A. Zero-engineering content additions — issue only requires inserting data into an
      existing structure, no logic/code authored:
      - Adding a quote, proverb, joke, fact, or fortune to a list/array/file
      - Adding a translation or locale string with no code change beyond the string itself
      - Adding yourself/a link/a project to a directory, awesome-list, or contributors file
      - Fixing a single typo/formatting nit with no other content in the body

    B. Structural spam:
      - Body is empty, templated boilerplate, or under ~15 words with no actionable detail
      - Auto-generated or duplicate placeholder with no human-written task description
      - Title/body signal pure PR-count farming (hacktoberfest-farming, no real task)

    Rejected issues get a score of 0 with a reason explaining the rejection.
    Do not score rejected issues further.

    ## STEP 1: Extract required skills from evidence, not assumption

    For each surviving issue, read the actual body, code snippets, stack traces, file paths,
    and labels. Extract the concrete technologies/skills genuinely required.
    Do not infer a skill requirement from the repo's general tech stack alone — only from
    what THIS issue's content demonstrates. If the issue lacks enough detail to determine
    required skills confidently, say so — do not guess.

    ## STEP 2: Score against developer profile

    - 0.9–1.0: Perfect match — developer has all required skills, issue is clearly scoped
    - 0.7–0.89: Strong match — developer has most skills, minor gaps they can bridge
    - 0.5–0.69: Partial match — developer has foundational skills but significant gaps exist
    - 0.3–0.49: Weak match — developer has adjacent skills but issue requires different expertise
    - 0.0–0.29: Poor match — issue requires skills the developer does not have

    Calibration: a high score means the developer can realistically open a PR within a few
    days based on the ACTUAL scope described. Be strict. If in doubt, score lower.
  `.trim(),
  model: scoringModels,
});

const EvaluationSchema = z.object({
  evaluations: z.array(
    z.object({
      issueId: z.string(),
      score: z.number().min(0).max(1),
      reason: z.string(),
    }),
  ),
});

export type IssueEvaluation = {
  issueId: string;
  score: number;
  reason: string;
};

export type ScorableIssue = {
  id: string;
  title: string;
  body: string | null;
};

const cleanupIssueBody = (body: string | null): string => {
  if (!body) return "No description provided.";

  const cleanedBody = body
    .replace(/[#_~`>-]/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[<][^>]*/g, "")
    .trim();

  return cleanedBody.slice(0, 700);
};

export const scoreIssues = async (
  issues: ScorableIssue[],
  skillsText: string,
): Promise<IssueEvaluation[]> => {
  const issuesList = issues
    .map(
      (issue, idx) =>
        `Issue ${idx + 1}:
           ID: ${issue.id}
           Title: ${issue.title}
           Description: ${cleanupIssueBody(issue.body)}`,
    )
    .join("\n\n");

  const prompt = `
        Developer skills:
        ${skillsText}

        This developer is brand new — there is no prior decision history.
        Judge purely on technical skill fit against the issue's actual content.

        Evaluate the following ${issues.length} GitHub issues for this developer:

        ${issuesList}

        Return a structured evaluation for EVERY issue. Use the exact issue ID provided.
            `.trim();

  const result = await scoringAgent.generate(prompt, {
    structuredOutput: {
      schema: EvaluationSchema,
    },
  });

  const evaluations: IssueEvaluation[] = result.object
    .evaluations as IssueEvaluation[];

  // Safety net: if the agent missed any issue, assign a neutral score so the
  // issue is neither recommended nor silently dropped from evaluation history.
  const evaluatedIds = new Set(evaluations.map((e) => e.issueId));
  for (const issue of issues) {
    if (!evaluatedIds.has(issue.id)) {
      logger.warn(
        { issueId: issue.id },
        `Scoring agent missed issue ${issue.id} — assigning neutral score`,
      );
      evaluations.push({
        issueId: issue.id,
        score: 0.5,
        reason: "Could not be evaluated — assigned neutral score",
      });
    }
  }

  return evaluations;
};
