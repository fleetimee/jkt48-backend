import { and, eq, lt, sql } from 'drizzle-orm';

import db from '../../db';
import { order } from '../../models/order';

/**
 * Retrieves an order by its ID.
 * @param orderId - The ID of the order to retrieve.
 * @returns The order item matching the provided ID, or undefined if not found.
 */
export const getOrderById = async (orderId: string) => {
    const [orderItem] = await db.select().from(order).where(eq(order.id, orderId));

    return orderItem;
};

export const createOrder = async (
    userId: string,
    packageId: string,
    paymentMethod: string,
    subtotal: number,
    tax: number,
    total: number,
    idolIds: string[],
) => {
    const order = await db.transaction(async trx => {
        const [order] = await trx.execute(sql`
        INSERT INTO public."order" (user_id, package_id, payment_method, subtotal, tax, total, order_status)
        VALUES (${userId}, ${packageId}, ${paymentMethod}::payment_method, ${subtotal}, ${tax}, ${total}, 'pending'::order_status)
        RETURNING *;
        `);

        for (const idolId of idolIds) {
            await trx.execute(sql`
            INSERT INTO order_idol (order_id, idol_id)
            VALUES (${order.id}, ${idolId});
            `);
        }

        return order;
    });

    return order;
};

/**
 * Retrieves the details of an order by its ID.
 *
 * @param {string} orderId - The ID of the order to retrieve.
 * @returns {Promise<Object>} - The order details.
 */
export const getInquiryOrder = async (orderId: string) => {
    const [order] = await db.execute(sql`
    SELECT o.id           AS order_id,
       o.subtotal     AS order_subtotal,
       o.tax          AS order_tax,
       o.total        AS order_total,
       p.name         AS package_name,
       p.description  AS package_description,
       p.price        AS package_price,
       'subscription' AS category,
       1              AS quantity
    FROM "order" o
            INNER JOIN users u ON o.user_id = u.id
            INNER JOIN package p ON o.package_id = p.id
    WHERE o.id = ${orderId}
    `);

    return order;
};

/**
 * Retrieves the list of idol nicknames associated with a specific order ID.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<string[]>} - A promise that resolves to an array of idol nicknames.
 */
export const getInquiryOrderListIdol = async (orderId: string) => {
    const order = await db.execute(sql`
    SELECT i.given_name AS idol_nickname
    FROM order_idol
            INNER JOIN "order" o ON order_idol.order_id = o.id
            INNER JOIN idol i ON order_idol.idol_id = i.id
    WHERE o.id = ${orderId}
    `);

    const idolNicknames = order.map(row => row.idol_nickname);

    return idolNicknames;
};

export const updateExpiredOrderStatus = async () => {
    await db
        .update(order)
        .set({ orderStatus: 'expired' })
        .where(and(eq(order.orderStatus, 'success'), lt(order.expiredAt, new Date())));
};
