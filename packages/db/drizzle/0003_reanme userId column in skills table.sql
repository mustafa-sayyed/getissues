ALTER TABLE "skills" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "skills" DROP CONSTRAINT "skills_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;