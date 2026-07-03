import { account, session, user, verification } from "./schema/user.model.js";
import { issue } from "./schema/issue.model.js";
import { repoAnalysis } from "./schema/repoAnalysis.model.js";
import { recommendations } from "./schema/recommendation.model.js";
import { skills } from "./schema/skills.model.js";
import { agentRuns } from "./schema/agentRuns.model.js";
import { agentConfig } from "./schema/agentConfig.model.js";
import { agentIssueEvaluation } from "./schema/agentIssueEvaluation.model.js";

export const schema = {
  user,
  session,
  account,
  verification,
  issue,
  repoAnalysis,
  recommendations,
  skills,
  agentRuns,
  agentConfig,
  agentIssueEvaluation,
};
