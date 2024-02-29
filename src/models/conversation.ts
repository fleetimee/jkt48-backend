import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { idol } from './idol';

export const conversation = pgTable('conversation', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    idolId: varchar('idol_id', {
        length: 10,
    })
        .references(() => idol.id)
        .notNull()
        .unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
