import { cleanupIssueWorkflow } from "./functions/cleanupIssues.js";
import {
  ingestIssuesWorkflow,
  processIssueBatchWorkflow,
} from "./functions/ingestIssues.js";
import {
  userAgentWorkflow,
  userRecommendationSchedulerWorkflow,
} from "./functions/userRecommendation.js";

export const functions = [
  ingestIssuesWorkflow,
  processIssueBatchWorkflow,
  cleanupIssueWorkflow,
  userRecommendationSchedulerWorkflow,
  userAgentWorkflow,
];