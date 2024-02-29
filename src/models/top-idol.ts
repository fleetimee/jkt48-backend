import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { idol } from './idol';

export const topIdol = pgTable('idol_top', {
    id_idol: varchar('id_idol', {
        length: 10,
    })
        .primaryKey()
        .unique()
        .notNull()
        .references(() => idol.id),
    subscriptionCount: integer('subscription_count'),
});
