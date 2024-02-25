ALTER TABLE "users" ADD COLUMN "email_verified" text DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fcm_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" text DEFAULT 'now()' NOT NULL;