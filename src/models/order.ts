import { jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { packagePayment } from './package';
import { users } from './users';

export const oderStatusEnum = pgEnum('order_status', ['pending', 'success', 'failed', 'expired', 'cancelled']);

export const paymentMethodEnum = pgEnum('payment_method', [
    'xendit',
    'midtrans',
    'gopay',
    'ovo',
    'dana',
    'google_pay',
    'apple_pay',
]);

export const order = pgTable('order', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    packageId: uuid('package_id')
        .notNull()
        .references(() => packagePayment.id),
    paymentMethod: paymentMethodEnum('payment_method'),
    subtotal: numeric('subtotal').notNull(),
    tax: numeric('tax').notNull(),
    total: numeric('total').notNull(),
    orderStatus: oderStatusEnum('order_status'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    expiredAt: timestamp('expired_at'),
    callbackData: jsonb('callback_data'),
    appleOriginalTransactionId: text('apple_original_transaction_id'),
    googlePurchaseToken: text('google_purchase_token'),
    googlePurchaseId: text('google_purchase_id'),
});
