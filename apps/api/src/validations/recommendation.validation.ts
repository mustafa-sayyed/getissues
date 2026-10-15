import { z } from "zod";

/** Validates a single UUID route param, e.g. { recommendationId: "…" }. */
export const uuidParam = (name: string) =>
  z.object({ [name]: z.uuid(`Invalid ${name}`) });

export const recommendationIdParam = uuidParam("recommendationId");

export const runIdParam = uuidParam("runId");

export const issueIdParam = uuidParam("id");

export const recommendationsQuerySchema = z.object({
  status: z
    .enum(["notviewed", "viewed", "bookmarked", "notinterested"])
    .optional(),
  issueStatus: z.enum(["open", "closed", "assigned"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.uuid("Invalid cursor").optional(),
});

export const updateRecommendationStatusSchema = z.object({
  status: z.enum(["notviewed", "viewed", "bookmarked", "notinterested"]),
});

export const updateRecommendationFeedbackSchema = z.object({
  feedback: z.enum(["helpful", "not_helpful"]).nullable(),
  dismissReason: z.string().trim().max(200).optional().nullable(),
});
