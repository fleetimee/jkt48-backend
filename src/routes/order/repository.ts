import { sql } from 'drizzle-orm';

import db from '../../db';

export const createOrder = async (
    userId: string,
    packageId: string,
    paymentMethod: string,
    subtotal: number,
    tax: number,
    total: number,
) => {
    await db.transaction(async trx => {
        const [orderId] = await trx.execute(sql`
        INSERT INTO order (user_id, package_id, payment_method, subtotal, tax, total)
        VALUES (${userId}, ${packageId}, ${paymentMethod}, ${subtotal}, ${tax}, ${total})
        RETURNING id;
        `);

        return orderId;
    });
};
