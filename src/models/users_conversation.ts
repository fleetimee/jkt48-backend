import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { conversation } from './conversation';
import { users } from './users';

export const usersConversation = pgTable('users_conversation', {
    user_id: uuid('user_id')
        .notNull()
        .references(() => users.id),
    conversation_id: uuid('conversation_id')
        .notNull()
        .references(() => conversation.id),
    last_read_message_id: uuid('last_read_message_id'),
    last_read_at: timestamp('last_read_at'),
});
