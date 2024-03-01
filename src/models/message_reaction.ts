import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { message } from './message';
import { users } from './users';

export const reaction = pgTable('reaction', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    emoji: text('emoji').notNull(),
});

export const messageReaction = pgTable('message_reaction', {
    messageId: uuid('message_id')
        .notNull()
        .references(() => message.id),
    usersId: uuid('users_id')
        .notNull()
        .references(() => users.id),
    reactionId: uuid('reaction_id')
        .notNull()
        .references(() => reaction.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
