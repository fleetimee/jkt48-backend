import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { conversation } from './conversation';
import { users } from './users';

export const message = pgTable('message', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    conversationId: uuid('conversation_id')
        .notNull()
        .references(() => conversation.id),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id),
    message: text('message').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
