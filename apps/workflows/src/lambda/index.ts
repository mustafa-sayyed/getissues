import { serve } from "inngest/lambda";
import { inngest } from "../inngest/client.js";
import { functions } from "../inngest/index.js";

export const handler = serve({
  client: inngest,
  functions: functions,
});
