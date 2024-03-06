import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users';

export const idol = pgTable('idol', {
    id: varchar('id', {
        length: 10,
    })
        .primaryKey()
        .unique()
        .notNull(),
    bio: text('bio'),
    givenName: text('given_name').notNull(),
    familyName: text('family_name').notNull(),
    horoscope: text('horoscope').notNull(),
    height: text('height'),
    bloodType: text('blood_type'),
    instagramUrl: text('instagram_url'),
    xUrl: text('x_url'),
    userId: uuid('user_id')
        .references(() => users.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        })
        .notNull()
        .unique(),
});
