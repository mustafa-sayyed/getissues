"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as motion from "framer-motion/client";
import { useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  CircleDot,
  ExternalLink,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { BackButton, PrimaryButton } from "@/components/onboarding/nav";
import { StepLede } from "@/components/onboarding/primitives";
import { SkillIcon } from "@/components/skill-icon";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PreviewIssue } from "@/types/onboarding";
import { track } from "@/lib/onboarding";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type StageEvent = {
  type: "stage";
  stage: string;
  message: string;
  batch?: number;
  totalBatches?: number;
};

type DoneEvent = {
  type: "done";
  runId: string;
  recommendations: PreviewIssue[];
};

type BatchVerdict = {
  issueId: string;
  title: string;
  score: number;
  reason: string;
  accepted: boolean;
};

type BatchEvent = {
  type: "batch";
  batch: number;
  totalBatches: number;
  candidateCount: number;
  verdicts: BatchVerdict[];
};

type ErrorEvent = {
  type: "error";
  message: string;
};

type StepSearchProps = {
  languages: string[];
  interests: string;
  onBack: () => void;
};

const STAGES = [
  { key: "saving", label: "Saving your skills" },
  { key: "searching", label: "Scanning open issues" },
  { key: "scoring", label: "Scoring skill fit" },
  { key: "storing", label: "Picking your top picks" },
] as const;

type RowStatus = "done" | "active" | "pending";

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(duration > 0 ? 0 : target);

  useEffect(() => {
    if (duration <= 0 || target <= 0) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function PipelineRow({
  label,
  status,
  children,
}: {
  label: string;
  status: RowStatus;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          status === "done" &&
            "border-primary bg-primary text-white dark:text-black",
          status === "active" && "border-primary/40 text-primary",
          status === "pending" && "border-border/60 text-muted-foreground",
        )}
      >
        {status === "done" ? (
          <Check className="size-3.5" />
        ) : status === "active" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <span className="size-1.5 rounded-full bg-current opacity-40" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug transition-colors",
            status === "active" && "font-medium text-foreground",
            status === "done" && "text-foreground/70",
            status === "pending" && "text-muted-foreground/60",
          )}
        >
          {label}
        </p>
        {children}
      </div>
    </li>
  );
}

export function StepSearch({ languages, interests, onBack }: StepSearchProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"working" | "done" | "error">("working");
  const [status, setStatus] = useState("Saving your choices…");
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [issues, setIssues] = useState<PreviewIssue[]>([]);
  const [verdicts, setVerdicts] = useState<BatchVerdict[]>([]);
  const [candidateCount, setCandidateCount] = useState<number | null>(null);
  const [showRuledOut, setShowRuledOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const run = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setError("Something is misconfigured. Please try again later.");
      setPhase("error");
      return;
    }

    try {
      // Single synchronous run: the backend saves skills, retrieves
      // candidates, scores them in batches, and streams live progress
      // events followed by one `done` event with real recommendations.
      const response = await fetch(`${apiUrl}/users/onboarding/run`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languages, interests }),
      });

      if (!response.ok || !response.body) {
        throw new Error(
          `Onboarding run failed${response.status ? ` (${response.status})` : ""}.`,
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      const handleEvent = (type: string, data: string) => {
        if (type === "stage") {
          const event = JSON.parse(data) as StageEvent;
          setStatus(event.message);
          const index = STAGES.findIndex((stage) => stage.key === event.stage);
          if (index !== -1) setStageIndex(index);
          setProgress(
            event.batch !== undefined && event.totalBatches !== undefined
              ? { current: event.batch, total: event.totalBatches }
              : null,
          );
        } else if (type === "batch") {
          const event = JSON.parse(data) as BatchEvent;
          setCandidateCount(event.candidateCount);
          setVerdicts((current) => [...current, ...event.verdicts]);
        } else if (type === "done") {
          const event = JSON.parse(data) as DoneEvent;
          finished = true;
          setStageIndex(STAGES.length);
          setIssues(event.recommendations.slice(0, 5));
          setPhase("done");
          track("onboarding_first_match_shown", {
            count: event.recommendations.length,
          });
        } else if (type === "error") {
          const event = JSON.parse(data) as ErrorEvent;
          throw new Error(event.message || "Something went wrong.");
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          let type = "";
          const dataLines: string[] = [];
          for (const line of block.split("\n")) {
            if (line.startsWith(":")) continue;
            if (line.startsWith("event:")) {
              type = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trimStart());
            }
          }
          if (type) handleEvent(type, dataLines.join("\n"));
          boundary = buffer.indexOf("\n\n");
        }
      }

      if (!finished) {
        throw new Error("The connection closed before finishing.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }, [languages, interests]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void run();
  }, [run]);

  const handleRetry = () => {
    setPhase("working");
    setStatus("Saving your choices…");
    setStageIndex(0);
    setProgress(null);
    setIssues([]);
    setVerdicts([]);
    setCandidateCount(null);
    setShowRuledOut(false);
    setError(null);
    void run();
  };

  const handleFinish = () => {
    toast.success("Saved. We will keep adding new matches.");
    track("onboarding_completed");
    router.replace("/dashboard");
  };

  if (phase === "working") {
    const accepted = verdicts
      .filter((v) => v.accepted)
      .sort((a, b) => b.score - a.score);
    const ruledOut = verdicts.filter((v) => !v.accepted);

    return (
      <div className="space-y-6">
        <StepLede>
          All saved.{" "}
          <span className="font-semibold text-foreground">
            Give us a moment —
          </span>
        </StepLede>

        <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm sm:p-7">
          <ol className="space-y-4">
            {STAGES.map((stage, i) => {
              const rowStatus: RowStatus =
                i < stageIndex
                  ? "done"
                  : i === stageIndex
                    ? "active"
                    : "pending";

              return (
                <PipelineRow
                  key={stage.key}
                  label={stage.label}
                  status={rowStatus}
                >
                  {stage.key === "searching" && candidateCount !== null && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {candidateCount} open issues found
                    </p>
                  )}
                  {stage.key === "scoring" &&
                    progress &&
                    rowStatus !== "pending" && (
                      <div className="mt-2 max-w-xs">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{
                              width: `${Math.round(
                                (progress.current / progress.total) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                          {progress.current} of {progress.total} batches
                        </p>
                      </div>
                    )}
                </PipelineRow>
              );
            })}
          </ol>

          {accepted.length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-5">
              <p className="text-xs font-medium text-muted-foreground">
                Cleared the bar so far ·{" "}
                <span className="text-foreground">{accepted.length}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {accepted.map((verdict) => (
                  <div
                    key={verdict.issueId}
                    className="flex max-w-full items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-1.5"
                  >
                    <Star className="size-3 shrink-0 text-primary" />
                    <span className="max-w-[15rem] truncate text-xs font-medium">
                      {verdict.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      {Math.round(verdict.score * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ruledOut.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowRuledOut((v) => !v)}
                className="flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {ruledOut.length} ruled out
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    showRuledOut && "rotate-180",
                  )}
                />
              </button>
              {showRuledOut && (
                <ul className="mt-2 space-y-1">
                  {ruledOut.map((verdict) => (
                    <li
                      key={verdict.issueId}
                      className="flex items-start gap-2 rounded-lg px-1 py-1"
                    >
                      <X className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-muted-foreground">
                          {verdict.title}
                        </p>
                        <p className="line-clamp-1 text-[11px] text-muted-foreground/70">
                          {verdict.reason}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground" aria-live="polite">
            {status}
          </p>
        </div>

        <BackButton onClick={onBack}>Go back</BackButton>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="space-y-5 rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <h2 className="font-heading text-2xl font-black tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <BackButton onClick={onBack} />
          <PrimaryButton onClick={handleRetry} withArrow={false}>
            Try again
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <StepSearchDone
      issues={issues}
      onBack={onBack}
      onFinish={handleFinish}
      reduceMotion={Boolean(reduceMotion)}
    />
  );
}

function StepSearchDone({
  issues,
  onBack,
  onFinish,
  reduceMotion,
}: {
  issues: PreviewIssue[];
  onBack: () => void;
  onFinish: () => void;
  reduceMotion: boolean;
}) {
  const count = useCountUp(issues.length, reduceMotion ? 0 : 700);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-black tracking-tight">
          {issues.length > 0
            ? `${count} thing${issues.length === 1 ? "" : "s"} picked for you.`
            : "You are all set."}
        </h2>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          {issues.length > 0
            ? "Start with these — we are finding more in the background."
            : "We did not find instant matches, but we are still looking and will add more soon."}
        </p>
      </div>

      <div className="space-y-3">
        {issues.map((issue, i) => {
          const score =
            typeof issue.similarity === "number"
              ? Math.round(issue.similarity * 100)
              : null;
          return (
            <motion.a
              key={issue.id}
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("onboarding_first_match_clicked", { issueId: issue.id })
              }
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                delay: reduceMotion ? 0 : 0.15 + i * 0.12,
                ease: EASE,
              }}
              className="group block overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <CircleDot className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium leading-snug transition-colors group-hover:text-primary">
                      {issue.title}
                    </h3>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {issue.repo?.name ?? "Unknown project"}
                    </p>
                  </div>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {score !== null && (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{
                            duration: reduceMotion ? 0 : 0.8,
                            delay: reduceMotion ? 0 : 0.4 + i * 0.12,
                            ease: EASE,
                          }}
                        />
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
                        <Star className="size-3" />
                        {score}% fit
                      </span>
                    </div>
                  )}
                  <div className="ml-auto flex shrink-0 gap-1.5">
                    {(issue.repo?.languages ?? []).slice(0, 2).map((lang) => (
                      <span
                        key={lang}
                        className="flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        <SkillIcon
                          name={lang}
                          className="size-3 text-foreground"
                        />
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <PrimaryButton onClick={onFinish} className="w-full sm:w-auto sm:px-10">
          Go to dashboard
        </PrimaryButton>
        <BackButton onClick={onBack}>Adjust your skills</BackButton>
      </div>
    </div>
  );
}
