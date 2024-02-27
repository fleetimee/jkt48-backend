import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const privacyPolicy = pgTable('privacy_policy', {
    id: uuid('id').primaryKey().defaultRandom(),
    html_content: text('html_content').notNull(),
});
