import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { idol } from './idol';

export const birthdayMessage = pgTable('birthday_message', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    idolId: varchar('idol_id', {
        length: 10,
    })
        .references(() => idol.id)
        .notNull()
        .unique(),
    message: varchar('message').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
