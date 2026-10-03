"use client";

import * as motion from "framer-motion/client";
import {
  Bug,
  FileText,
  FlaskConical,
  Gauge,
  Hammer,
  Leaf,
  Palette,
  Plug,
  Rocket,
  Sprout,
  Trophy,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { BackButton, PrimaryButton } from "@/components/onboarding/nav";
import { StepLabel, StepLede } from "@/components/onboarding/primitives";
import { cn } from "@/lib/utils";
import type { Vibe } from "@/types/onboarding";

const journeys = [
  {
    value: "First-timer",
    icon: Sprout,
    hint: "Never merged a PR yet — guide me",
  },
  {
    value: "Getting going",
    icon: Rocket,
    hint: "A few PRs under my belt",
  },
  {
    value: "Regular",
    icon: Trophy,
    hint: "I merge often — challenge me",
  },
];

const flavors = [
  { value: "Bug fixes", icon: Bug },
  { value: "New features", icon: Hammer },
  { value: "Docs", icon: FileText },
  { value: "UI", icon: Palette },
  { value: "Performance", icon: Gauge },
  { value: "Testing", icon: FlaskConical },
  { value: "Accessibility", icon: Leaf },
  { value: "APIs", icon: Plug },
  { value: "Dev tools", icon: Wrench },
];

type StepVibeProps = {
  vibe: Vibe;
  onVibeChange: (vibe: Vibe) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepVibe({ vibe, onVibeChange, onNext, onBack }: StepVibeProps) {
  const canContinue = vibe.journey.length > 0;

  const toggleFlavor = (value: string) => {
    if (vibe.flavors.includes(value)) {
      onVibeChange({
        ...vibe,
        flavors: vibe.flavors.filter((f) => f !== value),
      });
    } else {
      onVibeChange({ ...vibe, flavors: [...vibe.flavors, value] });
    }
  };

  return (
    <div className="space-y-7">
      <StepLede>
        Two taps, then the fun part.{" "}
        <span className="font-semibold text-foreground">
          This decides what we show first.
        </span>
      </StepLede>

      <div className="space-y-2.5">
        <StepLabel>Where are you on your journey?</StepLabel>
        <div className="grid grid-cols-1 gap-3">
          {journeys.map((j, i) => {
            const selected = vibe.journey === j.value;
            return (
              <motion.button
                key={j.value}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onVibeChange({ ...vibe, journey: j.value })}
                className={cn(
                  "flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 text-left transition-all",
                  selected
                    ? "border-primary bg-primary/[0.07] shadow-lg shadow-primary/10"
                    : "border-border/60 bg-card/40 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    selected
                      ? "bg-primary text-white dark:text-black"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <j.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-base font-bold tracking-tight">
                    {j.value}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {j.hint}
                  </span>
                </span>
                <span
                  className={cn(
                    "ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    selected
                      ? "border-primary bg-primary"
                      : "border-border/60",
                  )}
                  aria-hidden
                >
                  {selected && (
                    <span className="size-1.5 rounded-full bg-white dark:bg-black" />
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <StepLabel>
          What do you enjoy?{" "}
          <span className="opacity-50">(pick any, or skip)</span>
        </StepLabel>
        <div className="flex flex-wrap gap-2">
          {flavors.map((f) => {
            const selected = vibe.flavors.includes(f.value);
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFlavor(f.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all",
                  selected
                    ? "border-primary bg-primary text-white shadow-md shadow-primary/20 dark:text-black"
                    : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <f.icon className="size-3.5" />
                {f.value}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="note"
          className="text-sm font-medium text-muted-foreground"
        >
          Anything else? <span className="opacity-50">(you can skip)</span>
        </label>
        <Input
          id="note"
          value={vibe.note}
          onChange={(e) => onVibeChange({ ...vibe, note: e.target.value })}
          placeholder="e.g. I love offline apps, and avoid Java…"
          maxLength={140}
          className="h-12 rounded-2xl border-border/60 bg-card/40 px-4 text-[15px] transition-shadow focus-visible:shadow-lg focus-visible:shadow-primary/10"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onNext} disabled={!canContinue}>
          Find things for me
        </PrimaryButton>
      </div>
    </div>
  );
}
