import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { Role } from '../utils/enum';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    passwordHash: text('password_hash').notNull(),
    fcmId: text('fcm_id'),
    verificationToken: text('verification_token'),
    roles: text('roles').default(Role.USER).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
