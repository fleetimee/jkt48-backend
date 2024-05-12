import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { idol } from './idol';
import { users } from './users';

export const messageScheduled = pgTable('message_scheduled', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    usersId: uuid('users_id')
        .notNull()
        .references(() => users.id),
    idolId: varchar('idol_id', {
        length: 10,
    })
        .notNull()
        .references(() => idol.id),
    personalizedMessage: varchar('personalized_message').notNull(),
});
