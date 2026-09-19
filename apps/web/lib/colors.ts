import {
  AgentConfigStatus,
  AgentRunStatus,
  IssueStatus,
} from "@/types/dashboard";

const issueStatusColor: Record<IssueStatus, string> = {
  open: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  assigned: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  closed: "bg-muted text-muted-foreground",
};

const agentRunColor: Record<AgentRunStatus, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  running: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const agentConfigColor: Record<AgentConfigStatus, string> = {
  idle: "bg-muted text-muted-foreground",
  running: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

const langColor: Record<string, string> = {
  typescript: "bg-[#3178c6] text-white",
  javascript: "bg-[#f1e05a] text-black",
  python: "bg-[#3572A5] text-white",
  rust: "bg-[#dea584] text-black",
  go: "bg-[#00ADD8] text-black",
  java: "bg-[#b07219] text-white",
  default: "bg-[#64748b] text-white",
};

export { langColor, agentRunColor, issueStatusColor, agentConfigColor };
