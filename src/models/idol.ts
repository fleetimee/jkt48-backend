import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users';

export const idol = pgTable('idol', {
    id: varchar('id', {
        length: 10,
    })
        .primaryKey()
        .unique()
        .notNull(),
    givenName: text('given_name').notNull(),
    familyName: text('family_name').notNull(),
    horoscope: text('horoscope').notNull(),
    userId: uuid('user_id')
        .references(() => users.id)
        .notNull()
        .unique(),
});
