"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import { AnimatePresence } from "framer-motion";
import { StepGithub } from "@/components/onboarding/step-github";
import { StepVibe } from "@/components/onboarding/step-vibe";
import { StepSearch } from "@/components/onboarding/step-search";
import { StepWelcome } from "@/components/onboarding/step-welcome";
import type { OnboardingProfile, Vibe } from "@/types/onboarding";
import { composeInterests, track } from "@/lib/onboarding";
import { EASE } from "@/lib/motion";

type WizardProps = {
  initialProfile: OnboardingProfile | null;
  userName: string;
  userImage: string;
};

const headlines = [
  {
    kicker: "Welcome",
    title: "We looked at your GitHub.",
  },
  {
    kicker: "Step 1 of 4 • Skills",
    title: "What do you work with?",
  },
  {
    kicker: "Step 2 of 4 • Style",
    title: "What fits you best?",
  },
  {
    kicker: "Step 3 of 4 • Matches",
    title: "Finding your first matches.",
  },
];

const progress = [25, 50, 75, 100];

export function OnboardingWizard({
  initialProfile,
  userName,
  userImage,
}: WizardProps) {
  const [step, setStep] = useState(0);
  const [languages, setLanguages] = useState<string[]>(
    initialProfile?.detectedLanguages.map((l) => l.name) ?? [],
  );
  const [vibe, setVibe] = useState<Vibe>({
    journey: "",
    flavors: [],
    note: "",
  });

  const headline = headlines[step];

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-primary">
            {headline.kicker}
          </span>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {progress[step]}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress[step]}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      </div>

      <motion.div
        key={`headline-${step}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          {headline.title}
        </h1>
      </motion.div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {step === 0 && (
              <StepWelcome
                profile={initialProfile}
                userName={userName}
                userImage={userImage}
                onNext={() => {
                  track("onboarding_started");
                  setStep(1);
                }}
              />
            )}

            {step === 1 && (
              <StepGithub
                initialProfile={initialProfile}
                languages={languages}
                onLanguagesChange={setLanguages}
                onNext={() => {
                  track("onboarding_github_confirmed", {
                    count: languages.length,
                  });
                  setStep(2);
                }}
                onBack={() => setStep(0)}
              />
            )}

            {step === 2 && (
              <StepVibe
                vibe={vibe}
                onVibeChange={setVibe}
                onNext={() => {
                  track("onboarding_vibe_selected", {
                    journey: vibe.journey,
                    flavors: vibe.flavors.length,
                  });
                  setStep(3);
                }}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <StepSearch
                languages={languages}
                interests={composeInterests(vibe)}
                onBack={() => setStep(2)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
