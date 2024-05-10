import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const fcmTokens = pgTable('fcm_token', {
    id: uuid('id').primaryKey().defaultRandom(),
    token: text('token').notNull(),
    userId: uuid('user_id')
        .references(() => users.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        })
        .notNull()
        .unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    lastAccessed: timestamp('last_accessed').notNull().defaultNow(),
    model: text('model'),
});
