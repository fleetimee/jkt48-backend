ALTER TABLE "message_attachment" ADD COLUMN "file_size" bigint;--> statement-breakpoint
ALTER TABLE "message_attachment" ADD COLUMN "checksum" varchar(64);