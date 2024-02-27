CREATE TABLE IF NOT EXISTS "privacy_policy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"html_content" text NOT NULL
);
