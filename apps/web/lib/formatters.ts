const formatRelativeTime = (value: string | null) => {
  if (!value) return "Never";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) return "Never";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatScore = (score: number | null) => {
  if (typeof score !== "number") return "N/A";
  return `${Math.round(score * 100)}%`;
};

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const formatCountdown = (target: string | null, current: number) => {
  if (!target) return "Not scheduled";

  const diffMs = new Date(target).getTime() - current;

  if (Number.isNaN(diffMs)) return "Not scheduled";
  if (diffMs <= 0) return "Due now";

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0)
    return `${hours}h ${minutes}m ${String(seconds).padStart(2, "0")}s`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
};

const formatDateTime = (value: string | null) => {
  if (!value) return "No run scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No run scheduled";

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

export {
  formatCountdown,
  formatDateTime,
  formatRelativeTime,
  formatScore,
  formatStatus,
};
