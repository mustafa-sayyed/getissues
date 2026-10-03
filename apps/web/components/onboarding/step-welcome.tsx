"use client";

import { useEffect, useState } from "react";
import * as motion from "framer-motion/client";
import { AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/onboarding/nav";
import { SkillIcon } from "@/components/skill-icon";
import { cn } from "@/lib/utils";
import type { OnboardingProfile } from "@/types/onboarding";

type StepWelcomeProps = {
  profile: OnboardingProfile | null;
  userName: string;
  userImage: string;
  onNext: () => void;
};

const STATEMENT_INTERVAL_MS = 2400;

function buildStatements(
  profile: OnboardingProfile | null,
  firstName: string,
): string[] {
  if (!profile) {
    return [
      `Hi ${firstName} — your GitHub is connected.`,
      "Answer 3 quick questions.",
      "We will find work that fits you.",
    ];
  }

  const statements = [
    `Hi ${firstName} — we found ${profile.publicRepos} public ${profile.publicRepos === 1 ? "repo" : "repos"} on your GitHub.`,
  ];

  const topLangs = profile.detectedLanguages.slice(0, 2).map((l) => l.name);
  if (topLangs.length > 0) {
    statements.push(
      `Mostly ${topLangs.join(" and ")} — noted.`,
    );
  }

  if (profile.totalPRs > 0) {
    statements.push(
      `${profile.totalPRs} ${profile.totalPRs === 1 ? "pull request" : "pull requests"} tracked — nice.`,
    );
  }

  statements.push("Answer 3 quick questions to get your matches.");
  return statements;
}

export function StepWelcome({
  profile,
  userName,
  userImage,
  onNext,
}: StepWelcomeProps) {
  const firstName = userName.split(" ")[0] ?? "contributor";
  const avatar = profile?.avatarUrl ?? userImage;
  const identity = profile?.login ?? userName;

  const statements = buildStatements(profile, firstName);
  const [statementIndex, setStatementIndex] = useState(0);

  useEffect(() => {
    if (statements.length <= 1) return;
    const timer = setInterval(() => {
      setStatementIndex((i) => (i + 1) % statements.length);
    }, STATEMENT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [statements.length]);

  const topLangs = profile?.detectedLanguages.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="relative">
          <Avatar className="size-16 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
            <AvatarImage src={avatar} alt={identity} />
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {identity[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>
        <div>
          <p className="text-base font-bold">{identity}</p>
          <p className="text-sm text-muted-foreground">GitHub connected</p>
        </div>
      </motion.div>

      {/* Proof — what we actually found */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-border/60 bg-card/60 px-5 py-4 backdrop-blur-sm"
        >
          <span className="text-sm">
            <strong className="font-heading text-lg font-black tabular-nums tracking-tight">
              {profile.publicRepos}
            </strong>{" "}
            <span className="text-muted-foreground">repos</span>
          </span>
          <span className="h-8 w-px bg-border/60" aria-hidden />
          <span className="text-sm">
            <strong className="font-heading text-lg font-black tabular-nums tracking-tight">
              {profile.totalPRs}
            </strong>{" "}
            <span className="text-muted-foreground">pull requests</span>
          </span>
          {topLangs.length > 0 && (
            <>
              <span className="h-8 w-px bg-border/60" aria-hidden />
              <span className="flex flex-wrap gap-1.5">
                {topLangs.map((l, i) => (
                  <motion.span
                    key={l.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-1.5 pr-2.5 text-xs font-semibold text-primary"
                  >
                    <SkillIcon name={l.name} className="size-4" />
                    {l.name}
                  </motion.span>
                ))}
              </span>
            </>
          )}
        </motion.div>
      )}

      {/* Rotating statements */}
      <div className="min-h-14" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={statementIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-md text-lg leading-relaxed text-muted-foreground"
          >
            {statements[statementIndex].split(" — ")[0]}
            {statements[statementIndex].includes(" — ") && (
              <>
                {" — "}
                <span className="font-semibold text-foreground">
                  {statements[statementIndex].split(" — ")[1]}
                </span>
              </>
            )}
          </motion.p>
        </AnimatePresence>
        {statements.length > 1 && (
          <div className="mt-3 flex gap-1.5" aria-hidden>
            {statements.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === statementIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        )}
      </div>

      <PrimaryButton onClick={onNext} className="w-full px-8 sm:w-auto">
        Get started
      </PrimaryButton>
    </div>
  );
}
