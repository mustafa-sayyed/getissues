"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParams, useRouter } from "next/navigation";
import { LanguageCombobox } from "@/components/LanguageCombobox";
import { toast } from "sonner";
import axios from "axios";

function OnboardingDialogInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNewUser = searchParams.get("newUser") === "true";

  const [isOpen, setIsOpen] = useState(isNewUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (isNewUser) {
      setIsOpen(true);
    }
  }, [isNewUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!languages.length || details.trim().length < 10) {
      toast.error("Add at least one skill and a short preference note.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        toast.error("API URL is not configured.");
        return;
      }

      await axios.post(
        `${apiUrl}/users/skills`,
        {
          languages,
          interests: details,
        },
        {
          withCredentials: true,
        },
      );

      toast.success("Profile saved.");
      setIsOpen(false);
      router.replace("/dashboard"); // Remove ?newUser=true
    } catch (error) {
      toast.error("Failed to save profile.");
      console.error("Error saving skills:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing the dialog by clicking outside to force onboarding completion
        if (open) setIsOpen(true);
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Welcome to GetIssues! 👋</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself so our AI agent can recommend the
            perfect open-source issues for you to tackle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="skills"
              className="text-sm font-medium text-foreground"
            >
              Your Skills
            </label>
            <LanguageCombobox
              value={languages}
              onChange={setLanguages}
              disabled={isSubmitting}
              placeholder="e.g. React, TypeScript, Python, TailwindCSS"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="details"
              className="text-sm font-medium text-foreground"
            >
              What kind of issues do you want to work on?
            </label>
            <Textarea
              id="details"
              placeholder="I'm a frontend developer looking to help with UI/UX improvements, specifically in React and Next.js projects. I enjoy fixing bugs and writing clean components."
              className="h-28 resize-none"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting || !languages.length || details.trim().length < 10
            }
            className="w-full mt-2"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Saving profile...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function OnboardingDialog() {
  return (
    <Suspense fallback={null}>
      <OnboardingDialogInner />
    </Suspense>
  );
}
