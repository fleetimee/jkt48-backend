ALTER TABLE "news" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_slug_unique" UNIQUE("slug");