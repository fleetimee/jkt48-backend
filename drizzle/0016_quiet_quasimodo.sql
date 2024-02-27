CREATE TABLE IF NOT EXISTS "package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"total_members" numeric NOT NULL,
	"price" numeric NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL
);
