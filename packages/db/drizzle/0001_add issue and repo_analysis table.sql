CREATE EXTENSION IF NOT EXISTS vector; 
--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('open', 'closed', 'assigned');--> statement-breakpoint
CREATE TABLE "issue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"body" text,
	"status" "issue_status" DEFAULT 'open' NOT NULL,
	"url" text NOT NULL,
	"repo_analysis_id" uuid NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repo_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"repo_url" text NOT NULL,
	"languages" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"summary" text,
	"maintainer_responsiveness" integer,
	"last_activity_at" timestamp,
	"is_active" boolean,
	"is_less_crowded" boolean,
	"last_analyzed_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_repo_analysis_id_repo_analysis_id_fk" FOREIGN KEY ("repo_analysis_id") REFERENCES "public"."repo_analysis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_id_idx" ON "issue" USING btree ("id");--> statement-breakpoint
CREATE INDEX "repo_id_idx" ON "repo_analysis" USING btree ("id");