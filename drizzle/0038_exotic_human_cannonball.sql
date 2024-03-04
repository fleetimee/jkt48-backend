ALTER TABLE "order" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "expired_at" timestamp;