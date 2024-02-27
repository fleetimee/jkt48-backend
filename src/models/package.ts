import { boolean, numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const packagePayment = pgTable('package', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    totalMembers: numeric('total_members').notNull(),
    price: numeric('price').notNull(),
    isActive: boolean('is_active').default(false).notNull(),
});
