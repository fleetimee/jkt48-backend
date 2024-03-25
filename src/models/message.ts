import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
    isApproved: boolean('approved').notNull().default(false),
    isBirthdayMessage: boolean('is_birthday_message').notNull().default(false),
    receiverId: uuid('receiver_id').references(() => users.id),
});
