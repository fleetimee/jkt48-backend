ALTER TABLE "order_idol" DROP CONSTRAINT "order_idol_order_id_order_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_idol" ADD CONSTRAINT "order_idol_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
