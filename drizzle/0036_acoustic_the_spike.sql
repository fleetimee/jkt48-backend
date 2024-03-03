ALTER TABLE "order_idol" DROP CONSTRAINT "order_idol_idol_id_idol_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_idol" ADD CONSTRAINT "order_idol_idol_id_idol_id_fk" FOREIGN KEY ("idol_id") REFERENCES "idol"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
