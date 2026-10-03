"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingStatements } from "./loading-statements";

const stages = [
  "Opening your GitHub",
  "Looking at your repos",
  "Noting your skills",
  "Getting things ready",
];

export function FetchingState({
  userName,
  stage,
}: {
  userName?: string;
  stage?: number;
}) {
  const [tick, setTick] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (stage !== undefined) return;
    const t = setInterval(
      () => setTick((s) => Math.min(s + 1, stages.length - 1)),
      1500,
    );
    return () => clearInterval(t);
  }, [stage]);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const active = stage ?? tick;
  const pct = ((active + 1) / stages.length) * 100;
  const firstName = userName?.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <div className="mb-2.5 flex items-baseline justify-between text-xs">
          <span className="font-medium text-primary">
            {firstName ? `Hi ${firstName}` : "Fetching your profile..."}
          </span>
          <span className="font-semibold tabular-nums text-muted-foreground">
            {active + 1} / {stages.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <h2 className="min-h-10 text-3xl font-semibold tracking-tight">
        {/* {stages[active]}
        <span className="text-primary">…</span> */}
        <LoadingStatements />
      </h2>
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
        {slow
          ? "Taking longer than usual. Big profiles need a moment."
          : "This only takes a few seconds."}
      </p>

      <ul className="mt-8 space-y-2.5">
        {stages.map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm transition-all duration-500",
                current && "border-primary/40 bg-primary/5 scale-[1.01]",
                done && "border-border/60 text-muted-foreground",
                !done &&
                  !current &&
                  "border-border/40 text-muted-foreground/40",
              )}
            >
              {done ? (
                <Check className="size-4 text-primary" />
              ) : current ? (
                <Loader2 className="size-4 text-primary motion-safe:animate-spin" />
              ) : (
                <span className="size-4 rounded-full border border-border/60" />
              )}
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
