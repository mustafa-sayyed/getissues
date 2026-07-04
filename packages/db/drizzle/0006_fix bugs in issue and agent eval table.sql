ALTER TABLE "agent_issue_evaluation" DROP CONSTRAINT "agent_issue_evaluation_issue_id_issue_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_issue_evaluation" DROP CONSTRAINT "agent_issue_evaluation_agent_id_agent_runs_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_issue_evaluation" DROP CONSTRAINT "agent_issue_evaluation_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "github_id" numeric;--> statement-breakpoint
ALTER TABLE "agent_issue_evaluation" ADD CONSTRAINT "agent_issue_evaluation_issue_id_issue_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_issue_evaluation" ADD CONSTRAINT "agent_issue_evaluation_agent_id_agent_runs_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_issue_evaluation" ADD CONSTRAINT "agent_issue_evaluation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_github_id_unique" UNIQUE("github_id");--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_url_unique" UNIQUE("url");