CREATE TABLE IF NOT EXISTS "order_idol" (
	"order_id" uuid NOT NULL,
	"idol_id" varchar(10) NOT NULL,
	CONSTRAINT "order_idol_idol_id_unique" UNIQUE("idol_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_idol" ADD CONSTRAINT "order_idol_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_idol" ADD CONSTRAINT "order_idol_idol_id_idol_id_fk" FOREIGN KEY ("idol_id") REFERENCES "idol"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
