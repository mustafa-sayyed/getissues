"use client";

import { Bot } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import type { AgentRun, AgentRunsResponse } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/formatters";

export function LiveRunBanner({ initialRun }: { initialRun: AgentRun | null }) {

  const [liveRun, setLiveRun] = useState<AgentRun | null>(initialRun);
  const liveRunRef = useRef<{ id: string; status: AgentRun["status"] } | null>(
    initialRun ? { id: initialRun.id, status: initialRun.status } : null,
  );
  
  const router = useRouter();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    let cancelled = false;

    const pollLiveRun = async () => {
      try {
        const { data } = await axios.get<AgentRunsResponse>(
          `${apiUrl}/agent-runs?limit=1`,
          { withCredentials: true },
        );
        if (cancelled) return;

        const latest = data.agentRuns[0] ?? null;
        setLiveRun(latest);

        const prev = liveRunRef.current;
        if (latest) {
          liveRunRef.current = { id: latest.id, status: latest.status };
        }

        if (
          prev &&
          latest &&
          prev.id === latest.id &&
          prev.status === "running" &&
          latest.status !== "running"
        ) {
          if (latest.status === "success") {
            toast.success(
              latest.recommendationsCreated
                ? `${latest.recommendationsCreated} new recommendations found.`
                : "Agent run finished.",
            );
          } else {
            toast.error("Agent run failed.");
          }
          router.refresh();
        }
      } catch {
        // Polling must never break the dashboard.
      }
    };

    const intervalId = setInterval(() => void pollLiveRun(), 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [router]);

  if (!liveRun) return null;

  if (liveRun.status === "running") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 p-4">
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-sky-500" />
        </span>
        <p className="text-sm text-foreground">
          <span className="font-medium">Agent is finding new matches…</span>{" "}
          <span className="text-muted-foreground">
            Started {formatRelativeTime(liveRun.startedAt)}
          </span>
        </p>
        <Link
          href="/dashboard/agent-runs"
          className="ml-auto shrink-0 text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          View runs
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
      <Bot className="size-4 shrink-0 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Last run {formatRelativeTime(liveRun.startedAt)} ·{" "}
        {liveRun.recommendationsCreated ?? 0} new matches
      </p>
      <Link
        href="/dashboard/agent-runs"
        className="ml-auto shrink-0 text-sm font-medium text-primary hover:underline"
      >
        View runs
      </Link>
    </div>
  );
}
