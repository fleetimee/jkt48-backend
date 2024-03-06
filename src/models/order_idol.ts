import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { idol } from './idol';
import { order } from './order';

export const orderIdols = pgTable('order_idol', {
    orderId: uuid('order_id')
        .notNull()
        .references(() => order.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    idolId: varchar('idol_id', {
        length: 10,
    })
        .notNull()
        .references(() => idol.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
});
