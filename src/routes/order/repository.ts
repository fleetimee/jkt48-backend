import { sql } from 'drizzle-orm';

import db from '../../db';

export const createOrder = async (
    userId: string,
    packageId: string,
    paymentMethod: string,
    subtotal: number,
    tax: number,
    total: number,
    idolIds: string[],
) => {
    await db.transaction(async trx => {
        const [orderId] = await trx.execute(sql`
        INSERT INTO order (user_id, package_id, payment_method, subtotal, tax, total)
        VALUES (${userId}, ${packageId}, ${paymentMethod}, ${subtotal}, ${tax}, ${total})
        RETURNING id;
        `);

        for (const idolId of idolIds) {
            await trx.execute(sql`
            INSERT INTO order_idol (order_id, idol_id)
            VALUES (${orderId}, ${idolId});
            `);
        }

        return orderId;
    });
};
