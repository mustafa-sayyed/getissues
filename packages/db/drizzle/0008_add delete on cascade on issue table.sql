ALTER TABLE "issue" DROP CONSTRAINT "issue_github_repo_id_repo_analysis_github_repo_id_fk";
--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_github_repo_id_repo_analysis_github_repo_id_fk" FOREIGN KEY ("github_repo_id") REFERENCES "public"."repo_analysis"("github_repo_id") ON DELETE cascade ON UPDATE no action;