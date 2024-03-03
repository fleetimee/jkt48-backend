import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { idol } from './idol';
import { order } from './order';

export const orderIdols = pgTable('order_idol', {
    orderId: uuid('order_id')
        .notNull()
        .references(() => order.id),
    idolId: varchar('idol_id', {
        length: 10,
    })
        .notNull()
        .unique()
        .references(() => idol.id),
});
