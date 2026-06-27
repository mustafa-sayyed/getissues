CREATE TYPE "public"."agent_config_status" AS ENUM('idle', 'running', 'paused');--> statement-breakpoint
CREATE TYPE "public"."agent_config_type" AS ENUM('general', 'hacktoberfest', 'gssoc', 'gsoc', 'LFX');--> statement-breakpoint
CREATE TYPE "public"."agent_run_status" AS ENUM('failed', 'success', 'running');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('viewed', 'deleted', 'bookmarked', 'notviewed');--> statement-breakpoint
CREATE TABLE "agent_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"config_type" "agent_config_type" NOT NULL,
	"cron_schedule" text DEFAULT 'general' NOT NULL,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"status" "agent_config_status" DEFAULT 'idle' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "agent_run_status" NOT NULL,
	"started_at" timestamp with time zone DEFAULT now(),
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"issue_id" uuid NOT NULL,
	"agent_run_id" uuid NOT NULL,
	"reason" text,
	"match_score" real,
	"status" "recommendation_status" DEFAULT 'notviewed' NOT NULL,
	"recommended_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"name" text[] NOT NULL,
	"details" text NOT NULL,
	"embedding" vector(1536) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repo_analysis" RENAME COLUMN "summary" TO "description";--> statement-breakpoint
ALTER TABLE "issue" DROP CONSTRAINT "issue_repo_analysis_id_repo_analysis_id_fk";
--> statement-breakpoint
DROP INDEX "repo_id_idx";--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "github_repo_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "is_assigned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "repo_analysis" ADD COLUMN "github_repo_id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "repo_analysis" ADD COLUMN "documentation_score" integer;--> statement-breakpoint
ALTER TABLE "repo_analysis" ADD COLUMN "contributor_friendliness" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "github_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_active_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent_config" ADD CONSTRAINT "agent_config_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_issue_id_issue_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_agent_run_id_agent_runs_id_fk" FOREIGN KEY ("agent_run_id") REFERENCES "public"."agent_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_github_repo_id_repo_analysis_github_repo_id_fk" FOREIGN KEY ("github_repo_id") REFERENCES "public"."repo_analysis"("github_repo_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "repo_github_id_idx" ON "repo_analysis" USING btree ("github_repo_id");--> statement-breakpoint
ALTER TABLE "issue" DROP COLUMN "repo_analysis_id";--> statement-breakpoint
ALTER TABLE "repo_analysis" DROP COLUMN "id";