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
    console.log('idolIds', idolIds);
    console.log({ userId, packageId, paymentMethod, subtotal, tax, total, idolIds });

    await db.transaction(async trx => {
        const [orderId] = await trx.execute(sql`
        INSERT INTO public."order" (user_id, package_id, payment_method, subtotal, tax, total, order_status)
        VALUES (${userId}, ${packageId}, ${paymentMethod}::payment_method, ${subtotal}, ${tax}, ${total}, 'pending'::order_status)
        RETURNING id;
        `);

        for (const idolId of idolIds) {
            console.log({ orderId, idolId });

            await trx.execute(sql`
            INSERT INTO order_idol (order_id, idol_id)
            VALUES (${orderId.id}, ${idolId});
            `);
        }

        return orderId;
    });
};
