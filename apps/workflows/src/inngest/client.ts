import { WorkflowLogger } from "@packages/logging";
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "getissues-workflows",
  logger: WorkflowLogger,
});
