CREATE TABLE IF NOT EXISTS "birthday_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idol_id" varchar(10) NOT NULL,
	"message" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "birthday_message_id_unique" UNIQUE("id"),
	CONSTRAINT "birthday_message_idol_id_unique" UNIQUE("idol_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "birthday_message" ADD CONSTRAINT "birthday_message_idol_id_idol_id_fk" FOREIGN KEY ("idol_id") REFERENCES "idol"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
