import { boolean, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const packagePayment = pgTable('package', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    totalMembers: numeric('total_members').notNull(),
    price: numeric('price').notNull(),
    isActive: boolean('is_active').default(false).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    userId: uuid('user_id').references(() => users.id),
});
