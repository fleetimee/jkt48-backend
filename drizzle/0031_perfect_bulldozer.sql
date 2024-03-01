ALTER TABLE "message_attachment" ALTER COLUMN "file_size" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "message_attachment" ALTER COLUMN "file_size" DROP NOT NULL;