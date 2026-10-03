"use client";

import { useState } from "react";
import axios from "axios";
import * as motion from "framer-motion/client";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageCombobox } from "@/components/LanguageCombobox";
import { BackButton, PrimaryButton } from "@/components/onboarding/nav";
import { StepLabel, StepLede } from "@/components/onboarding/primitives";
import { SkillIcon } from "@/components/skill-icon";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { OnboardingProfile } from "@/types/onboarding";

type StepGithubProps = {
  initialProfile: OnboardingProfile | null;
  languages: string[];
  onLanguagesChange: (languages: string[]) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepGithub({
  initialProfile,
  languages,
  onLanguagesChange,
  onNext,
  onBack,
}: StepGithubProps) {
  const [profile, setProfile] = useState<OnboardingProfile | null>(
    initialProfile,
  );
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const retryLoad = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;
    setIsRetrying(true);
    setLoadError(null);
    try {
      const { data } = await axios.get<OnboardingProfile>(
        `${apiUrl}/users/onboarding-profile`,
        { withCredentials: true },
      );
      setProfile(data);
      if (languages.length === 0) {
        onLanguagesChange(data.detectedLanguages.map((l) => l.name));
      }
    } catch {
      setLoadError("Could not load your GitHub. You can add skills by hand.");
    } finally {
      setIsRetrying(false);
    }
  };

  const toggleLanguage = (name: string) => {
    const exists = languages.some(
      (l) => l.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      onLanguagesChange(
        languages.filter((l) => l.toLowerCase() !== name.toLowerCase()),
      );
    } else {
      onLanguagesChange([...languages, name]);
    }
  };

  return (
    <div className="space-y-7">
      <StepLede>
        We picked these from your public repos.{" "}
        <span className="font-semibold text-foreground">
          Tap to change them.
        </span>
      </StepLede>

      {!profile ? (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">
            {loadError ?? "Your GitHub did not load."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 cursor-pointer rounded-full"
            onClick={() => void retryLoad()}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <Spinner className="mr-2" /> Trying again…
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 size-3.5" /> Try again
              </>
            )}
          </Button>
        </div>
      ) : (
          <div className="flex flex-wrap gap-2.5">
            {profile.detectedLanguages.map((lang) => {
              const active = languages.some(
                (l) => l.toLowerCase() === lang.name.toLowerCase(),
              );
              return (
                <motion.button
                  key={lang.name}
                  type="button"
                  onClick={() => toggleLanguage(lang.name)}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border text-sm font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary pl-3.5 pr-5 text-white shadow-lg shadow-primary/25 dark:text-black"
                      : "border-border bg-card pl-3.5 pr-5 text-foreground hover:border-primary/60 hover:bg-primary/5",
                  )}
                >
                  <span className={cn(active ? "" : "text-primary")}>
                    <SkillIcon name={lang.name} className="size-5" />
                  </span>
                  {lang.name}
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="space-y-2.5">
        <StepLabel>Missing anything? Add it here</StepLabel>
        <LanguageCombobox
          value={languages}
          onChange={onLanguagesChange}
          placeholder="e.g. Rust, Go, writing docs"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <BackButton onClick={onBack} />
        <PrimaryButton onClick={onNext} disabled={languages.length === 0}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}
