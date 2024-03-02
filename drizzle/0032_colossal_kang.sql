ALTER TABLE "message_attachment" DROP CONSTRAINT "message_attachment_message_id_message_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
