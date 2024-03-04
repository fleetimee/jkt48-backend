import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { order } from '../../models/order';

/**
 * Retrieves an order by its ID.
 * @param orderId - The ID of the order to retrieve.
 * @returns The order item matching the provided ID, or undefined if not found.
 */
export const getOrderById = async (orderId: string) => {
    const [orderItem] = await db.select().from(order).where(eq(order.id, orderId));

    console.log('orderItem', orderItem);

    return orderItem;
};

/**
 * Creates a new order in the database.
 *
 * @param {string} userId - The ID of the user placing the order.
 * @param {string} packageId - The ID of the package being ordered.
 * @param {string} paymentMethod - The payment method used for the order.
 * @param {number} subtotal - The subtotal amount of the order.
 * @param {number} tax - The tax amount of the order.
 * @param {number} total - The total amount of the order.
 * @param {string[]} idolIds - An array of IDs of the idols included in the order.
 * @returns {Promise<number>} - The ID of the created order.
 */
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
        INSERT INTO public."order" (user_id, package_id, payment_method, subtotal, tax, total, order_status)
        VALUES (${userId}, ${packageId}, ${paymentMethod}::payment_method, ${subtotal}, ${tax}, ${total}, 'pending'::order_status)
        RETURNING id;
        `);

        for (const idolId of idolIds) {
            await trx.execute(sql`
            INSERT INTO order_idol (order_id, idol_id)
            VALUES (${orderId.id}, ${idolId});
            `);
        }

        return orderId;
    });
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
