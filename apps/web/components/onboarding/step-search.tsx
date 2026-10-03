"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as motion from "framer-motion/client";
import { CircleDot, ExternalLink, Star } from "lucide-react";
import { BackButton, PrimaryButton } from "@/components/onboarding/nav";
import { StepLede } from "@/components/onboarding/primitives";
import { SkillIcon } from "@/components/skill-icon";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PreviewIssue } from "@/types/onboarding";
import { track } from "@/lib/onboarding";
import { EASE } from "@/lib/motion";

type IssuesResponse = {
  issues: PreviewIssue[];
};

type StepSearchProps = {
  languages: string[];
  interests: string;
  onBack: () => void;
};

const statusLines = [
  "Saving your choices…",
  "Looking at open work…",
  "Picking your top matches…",
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function StepSearch({ languages, interests, onBack }: StepSearchProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"working" | "done" | "error">("working");
  const [lineIndex, setLineIndex] = useState(0);
  const [issues, setIssues] = useState<PreviewIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLineIndex((i) => (i + 1) % statusLines.length);
    }, 900);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setError("Something is misconfigured. Please try again later.");
        setPhase("error");
        return;
      }

      const startedAt = Date.now();
      try {
        try {
          await axios.post(
            `${apiUrl}/users/skills`,
            { languages, interests },
            { withCredentials: true },
          );
        } catch (postErr) {
          if (axios.isAxiosError(postErr) && postErr.response?.status === 400) {
            await axios.put(
              `${apiUrl}/users/skills`,
              { languages, interests },
              { withCredentials: true },
            );
          } else {
            throw postErr;
          }
        }

        const query = [...languages.slice(0, 5), interests]
          .join(" ")
          .slice(0, 300);

        let preview: PreviewIssue[] = [];
        try {
          const { data } = await axios.get<IssuesResponse>(
            `${apiUrl}/issues?searchMode=semantic&limit=3&search=${encodeURIComponent(query)}`,
            { withCredentials: true },
          );
          preview = data.issues;
        } catch {
          const { data } = await axios.get<IssuesResponse>(
            `${apiUrl}/issues?limit=3`,
            { withCredentials: true },
          );
          preview = data.issues;
        }

        const elapsed = Date.now() - startedAt;
        if (elapsed < 2200) await delay(2200 - elapsed);

        setIssues(preview.slice(0, 3));
        setPhase("done");
        track("onboarding_first_match_shown", { count: preview.length });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
        setPhase("error");
      }
    };

    void run();
  }, [languages, interests]);

  const handleFinish = () => {
    toast.success("Saved. We will keep adding new matches.");
    track("onboarding_completed");
    router.replace("/dashboard");
  };

  if (phase === "working") {
    return (
      <div className="space-y-6">
      <StepLede>
        All saved.{" "}
        <span className="font-semibold text-foreground">
          Give us a moment —
        </span>
      </StepLede>

        <div className="flex flex-col items-center rounded-3xl border border-border/60 bg-card/60 px-6 py-12 text-center backdrop-blur-sm">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-primary" />
          </span>
          <p className="mt-5 h-6 text-[15px] font-medium" aria-live="polite">
            {statusLines[lineIndex]}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This usually takes a few seconds
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
          <PrimaryButton
            onClick={() => window.location.reload()}
            withArrow={false}
          >
            Try again
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-black tracking-tight">
          {issues.length > 0
            ? "3 things picked for you."
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.12, ease: EASE }}
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
                            duration: 0.8,
                            delay: 0.4 + i * 0.12,
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
                        <SkillIcon name={lang} className="size-3 text-foreground" />
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

      <PrimaryButton
        onClick={handleFinish}
        className="w-full sm:w-auto sm:px-10"
      >
        Go to dashboard
      </PrimaryButton>
    </div>
  );
}
