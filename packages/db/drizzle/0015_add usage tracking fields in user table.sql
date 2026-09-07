CREATE TYPE "public"."recommendation_quota_window" AS ENUM('day', 'week', 'month');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "max_pending_recommendations" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "recommendation_quota_limit" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "recommendation_quota_window" "recommendation_quota_window" DEFAULT 'day' NOT NULL;