ALTER TABLE "agent_config" ALTER COLUMN "config_type" SET DEFAULT 'general';--> statement-breakpoint
ALTER TABLE "agent_config" ALTER COLUMN "cron_schedule" SET DEFAULT '0 */8 * * *';