"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

export type RecommendationFeedbackValue = "helpful" | "not_helpful" | null;

export const DISMISS_REASONS = [
  { value: "Not my languages", label: "Not my languages" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Not interested in this topic", label: "Not interested in topic" },
  { value: "Spammy or low-quality repo", label: "Spammy / low-quality repo" },
  { value: "Already working on something", label: "Already working on it" },
] as const;

type FeedbackResponse = {
  recommendation: {
    id: string;
    feedback: RecommendationFeedbackValue;
    dismissReason: string | null;
  };
};

const saveFeedback = async (
  recommendationId: string,
  feedback: Exclude<RecommendationFeedbackValue, null>,
  dismissReason: string | null,
) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const { data } = await axios.patch<FeedbackResponse>(
    `${apiUrl}/recommendations/${recommendationId}/feedback`,
    { feedback, dismissReason },
    { withCredentials: true },
  );

  return data.recommendation;
};

type FeedbackButtonsProps = {
  recommendationId: string;
  feedback: RecommendationFeedbackValue;
  disabled?: boolean;
  onSaved?: (feedback: RecommendationFeedbackValue) => void;
};

export function FeedbackButtons({
  recommendationId,
  feedback,
  disabled = false,
  onSaved,
}: FeedbackButtonsProps) {
  const [pending, setPending] = useState(false);
  const busy = pending || disabled;

  const handleVote = async (
    value: Exclude<RecommendationFeedbackValue, null>,
  ) => {
    if (busy) return;

    // Tapping the active vote again clears it.
    const next: RecommendationFeedbackValue =
      feedback === value ? null : value;

    setPending(true);

    try {
      if (next === null) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await axios.patch(
          `${apiUrl}/recommendations/${recommendationId}/feedback`,
          { feedback: null, dismissReason: null },
          { withCredentials: true },
        );
      } else {
        await saveFeedback(recommendationId, next, null);
      }

      onSaved?.(next);
    } catch (err) {
      console.error("Error saving feedback:", err);
      toast.error("Failed to save feedback.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={`size-8 ${
          feedback === "helpful"
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground"
        }`}
        disabled={busy}
        title="Helpful — show me more like this"
        onClick={(event) => {
          event.stopPropagation();
          void handleVote("helpful");
        }}
      >
        <ThumbsUp className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`size-8 ${
          feedback === "not_helpful"
            ? "bg-red-500/15 text-red-600 dark:text-red-400"
            : "text-muted-foreground"
        }`}
        disabled={busy}
        title="Not helpful — show me fewer like this"
        onClick={(event) => {
          event.stopPropagation();
          void handleVote("not_helpful");
        }}
      >
        <ThumbsDown className="size-3.5" />
      </Button>
    </div>
  );
}

type DismissReasonDialogProps = {
  recommendationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissed: (dismissReason: string | null) => void;
};

export function DismissReasonDialog({
  recommendationId,
  open,
  onOpenChange,
  onDismissed,
}: DismissReasonDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleDismiss = async (dismissReason: string | null) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await saveFeedback(recommendationId, "not_helpful", dismissReason);
      onOpenChange(false);
      onDismissed(dismissReason);
    } catch (err) {
      console.error("Error dismissing recommendation:", err);
      toast.error("Failed to dismiss recommendation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Not interested?</DialogTitle>
          <DialogDescription>
            Tell us why — your answer trains future recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          {DISMISS_REASONS.map((reason) => (
            <Button
              key={reason.value}
              variant="outline"
              className="h-9 justify-start font-normal"
              disabled={isSaving}
              onClick={() => void handleDismiss(reason.value)}
            >
              {reason.label}
            </Button>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            disabled={isSaving}
            onClick={() => void handleDismiss(null)}
          >
            Just hide it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
