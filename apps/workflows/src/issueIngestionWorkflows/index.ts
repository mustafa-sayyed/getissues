/**
 * Issue Ingestion Workflow
 *
 * Task execution chain:
 *   ingestIssuesWorkflow
 *     => deduplicateIssueTask       — skip if issue already in DB
 *           => ensureRepoTask       — upsert repo metadata into DB
 *                 => createIssueEmbeddingTask  — embed issue via VoyageAI
 *                       => storeIssueTask      — persist issue + embedding to DB
 */


// **** Re-exports ****
// All individual tasks are exported so they can be registered with the
// Render workflow runner independently.
export { ingestIssuesWorkflow } from "./tasks/ingestIssues.task.js";
export { deduplicateIssueTask } from "./tasks/deduplicateIssue.task.js";
export { ensureRepoTask } from "./tasks/ensureRepo.task.js";
export { createIssueEmbeddingTask } from "./tasks/createEmbedding.task.js";
export { storeIssueTask } from "./tasks/storeIssue.task.js";
