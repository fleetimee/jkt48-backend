CREATE TABLE IF NOT EXISTS "idol" (
	"id" varchar(4) PRIMARY KEY NOT NULL,
	"given_name" text NOT NULL,
	"family_name" text NOT NULL,
	"horoscope" text NOT NULL,
	"user_id" uuid,
	CONSTRAINT "idol_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idol" ADD CONSTRAINT "idol_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
