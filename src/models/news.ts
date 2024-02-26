import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const news = pgTable('news', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    image: text('image'),
    userId: uuid('user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
