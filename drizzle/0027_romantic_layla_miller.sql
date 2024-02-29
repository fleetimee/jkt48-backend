ALTER TABLE "conversation" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "message_attachment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();