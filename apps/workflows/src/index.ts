import "dotenv/config";
import { serve } from "inngest/lambda";
import { inngest } from "./inngest/client.js";
import { cleanupIssueWorkflow } from "./inngest/functions/cleanupIssues.js";
import {
  ingestIssuesWorkflow,
  processIssueBatchWorkflow,
} from "./inngest/functions/ingestIssues.js";
import {
  userAgentWorkflow,
  userRecommendationSchedulerWorkflow,
} from "./inngest/functions/userRecommendation.js";

const functions = [
  ingestIssuesWorkflow,
  processIssueBatchWorkflow,
  cleanupIssueWorkflow,
  userRecommendationSchedulerWorkflow,
  userAgentWorkflow,
];

export const handler = serve({
  client: inngest,
  functions,
});
