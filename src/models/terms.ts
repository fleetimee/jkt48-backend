import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const terms = pgTable('terms', {
    id: uuid('id').primaryKey().defaultRandom(),
    html_content: text('html_content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
