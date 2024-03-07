import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const announcement = pgTable('announcement', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
});
