import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { Role } from '../utils/enum';

export const deleteAccountStepEnum = pgEnum('delete_account_step', ['request', 'confirm', 'done']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    nickName: text('nickname'),
    profileImage: text('profile_image'),
    birthday: timestamp('birthday'),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    emailVerifiedAt: timestamp('email_verified_at'),
    passwordHash: text('password_hash').notNull(),
    fcmId: text('fcm_id'),
    verificationToken: text('verification_token'),
    roles: text('roles').default(Role.USER).notNull(),
    tokenResetPassword: text('token_reset_password'),
    tokenDeleteAccount: text('token_delete_account'),
    deleteAccountStep: deleteAccountStepEnum('delete_account_step'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    xenditCustomerId: text('xendit_customer_id'),
    phoneNumber: text('phone_number'),
});
