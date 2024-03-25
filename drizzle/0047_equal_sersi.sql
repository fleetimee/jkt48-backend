CREATE TABLE IF NOT EXISTS "users_news" (
	"user_id" uuid NOT NULL,
	"last_read_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_news" ADD CONSTRAINT "users_news_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
