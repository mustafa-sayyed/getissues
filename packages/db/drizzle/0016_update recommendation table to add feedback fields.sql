CREATE TYPE "public"."recommendation_feedback" AS ENUM('helpful', 'not_helpful');--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "status" SET DEFAULT 'notviewed'::text;--> statement-breakpoint
DROP TYPE "public"."recommendation_status";--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('viewed', 'notinterested', 'bookmarked', 'notviewed');--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "status" SET DEFAULT 'notviewed'::"public"."recommendation_status";--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "status" SET DATA TYPE "public"."recommendation_status" USING "status"::"public"."recommendation_status";--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "feedback" "recommendation_feedback";--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "dismiss_reason" text;