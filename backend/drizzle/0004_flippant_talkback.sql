ALTER TABLE "project_members" DROP CONSTRAINT "project_members_project_id_user_id_unique";--> statement-breakpoint
DROP INDEX "created_by_idx";--> statement-breakpoint
DROP INDEX "deleted_at_idx";--> statement-breakpoint
CREATE INDEX "project_created_by_idx" ON "projects" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "project_deleted_at_idx" ON "projects" USING btree ("deleted_At");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_user_unique" UNIQUE("project_id","user_id");