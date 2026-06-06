ALTER TABLE "refresh_tokens" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP COLUMN "updated_At";