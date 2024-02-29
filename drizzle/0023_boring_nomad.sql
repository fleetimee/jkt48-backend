CREATE TABLE IF NOT EXISTS "idol_top" (
	"id_idol" varchar(10) PRIMARY KEY NOT NULL,
	"subscription_count" integer,
	CONSTRAINT "idol_top_id_idol_unique" UNIQUE("id_idol")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idol_top" ADD CONSTRAINT "idol_top_id_idol_idol_id_fk" FOREIGN KEY ("id_idol") REFERENCES "idol"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
