"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { LanguageCombobox } from "@/components/LanguageCombobox";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function OnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [details, setDetails] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!languages.length || details.trim().length < 10) {
      toast.error("Add at least one skill and a short preference note.");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
      router.replace("/dashboard");
    } catch (error) {
      toast.error("Failed to save profile.");
      console.error("Error saving skills:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          isSubmitting
        }
        className="w-full mt-2 p-4 cursor-pointer"
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
  );
}
