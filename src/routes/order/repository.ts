import { and, desc, eq, lt, sql } from 'drizzle-orm';

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

/**
 * Retrieves an order by its Apple original transaction ID.
 * @param appleOriginalTransactionId - The Apple original transaction ID of the order.
 * @returns The order item matching the given Apple original transaction ID, or undefined if not found.
 */
export const getOrderByAppleOriginalTransactionId = async (appleOriginalTransactionId: string) => {
    const [orderItem] = await db
        .select()
        .from(order)
        .where(and(eq(order.appleOriginalTransactionId, appleOriginalTransactionId), eq(order.orderStatus, 'expired')))
        .orderBy(desc(order.updatedAt));

    return orderItem;
};

/**
 * Creates a new order in the database.
 *
 * @param userId - The ID of the user placing the order.
 * @param packageId - The ID of the package being ordered.
 * @param paymentMethod - The payment method used for the order.
 * @param subtotal - The subtotal amount of the order.
 * @param tax - The tax amount of the order.
 * @param total - The total amount of the order.
 * @param idolIds - An array of IDs of the idols associated with the order.
 * @param orderStatus - The status of the order (default: 'pending').
 * @param expiredAt - The expiration date of the order (optional).
 * @param appleOriginalTransactionId - The original transaction ID for Apple payments (optional).
 * @returns The created order object.
 */
export const createOrder = async (
    userId: string,
    packageId: string,
    paymentMethod: string,
    subtotal: number,
    tax: number,
    total: number,
    idolIds: string[],
    orderStatus = 'pending',
    expiredAt?: Date,
    appleOriginalTransactionId?: string,
) => {
    const order = await db.transaction(async trx => {
        let order;
        if (expiredAt && appleOriginalTransactionId) {
            [order] = await trx.execute(sql`
                INSERT INTO public."order" (
                    user_id, 
                    package_id, 
                    payment_method, 
                    subtotal, 
                    tax, 
                    total, 
                    order_status, 
                    expired_at, 
                    apple_original_transaction_id
                )
                VALUES (
                    ${userId}, 
                    ${packageId}, 
                    ${paymentMethod}::payment_method, 
                    ${subtotal}, 
                    ${tax}, 
                    ${total}, 
                    ${orderStatus}::order_status, 
                    ${expiredAt}, 
                    ${appleOriginalTransactionId}
                )
                RETURNING *;
            `);
        } else {
            [order] = await trx.execute(sql`
                INSERT INTO public."order" (
                    user_id, 
                    package_id, 
                    payment_method, 
                    subtotal, 
                    tax, 
                    total, 
                    order_status
                )
                VALUES (
                    ${userId}, 
                    ${packageId}, 
                    ${paymentMethod}::payment_method, 
                    ${subtotal}, 
                    ${tax}, 
                    ${total}, 
                    ${orderStatus}::order_status
                )
                RETURNING *;
            `);
        }

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

export const createOrderAppleResubscribe = async (appleOriginalTransactionId: string) => {
    const existingOrder = await getOrderByAppleOriginalTransactionId(appleOriginalTransactionId);

    if (!existingOrder) {
        throw new Error('Order not found');
    }

    const existingOrderIdols = await db.execute(sql`
        SELECT * FROM order_idol WHERE order_id = ${existingOrder.id};
    `);

    const idolIds = existingOrderIdols.map(idol => idol.idol_id);

    const date = new Date();

    const dateWithOneMonth = new Date(date.setMonth(date.getMonth() + 1));

    const newOrder = await createOrder(
        existingOrder.userId,
        existingOrder.packageId,
        existingOrder.paymentMethod as string,
        existingOrder.subtotal as unknown as number,
        existingOrder.tax as unknown as number,
        existingOrder.total as unknown as number,
        idolIds as string[],
        'success',
        dateWithOneMonth,
        appleOriginalTransactionId,
    );

    return newOrder;
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

/**
 * Retrieves expired orders from the database.
 * An order is considered expired if its orderStatus is 'expired' and its expiredAt date is earlier than the current date.
 *
 * @returns {Promise<Array<any>>} A promise that resolves to an array of expired orders.
 */
export const getExpiredOrders = async () => {
    const orders = await db.select().from(order).where(eq(order.orderStatus, 'expired'));

    return orders;
};

/**
 * Updates the status of expired orders to 'expired'.
 * This function finds orders that have a status of 'success' and an expiredAt date that is earlier than the current date,
 * and updates their orderStatus to 'expired'.
 */
export const updateExpiredOrderStatus = async () => {
    await db
        .update(order)
        .set({ orderStatus: 'expired' })
        .where(and(eq(order.orderStatus, 'success'), lt(order.expiredAt, new Date())));
};

/**
 * Updates the Google purchase token and ID for a specific order.
 *
 * @param orderId - The ID of the order to update.
 * @param googlePurchaseToken - The new Google purchase token.
 * @param googlePurchaseId - The new Google purchase ID.
 */
export const updateGooglePurchaseToken = async (
    orderId: string,
    googlePurchaseToken: string,
    googlePurchaseId: string,
) => {
    await db.update(order).set({ googlePurchaseToken, googlePurchaseId }).where(eq(order.id, orderId));
};

/**
 * Updates the order status to 'success' and sets the expiration date and update date for a given Google purchase token.
 * @param purchaseToken - The Google purchase token.
 * @param expiredAt - The expiration date for the order.
 * @returns A promise that resolves when the update is complete.
 */
export const updateOrderPurchasedGoogle = async (purchaseToken: string, expiredAt: Date) => {
    const date = new Date();

    await db
        .update(order)
        .set({ orderStatus: 'success', expiredAt: expiredAt, updatedAt: date })
        .where(and(eq(order.googlePurchaseToken, purchaseToken), eq(order.orderStatus, 'pending')));
};

/**
 * Updates the appleOriginalTransactionId of an order in the database.
 *
 * @param {string} orderId - The ID of the order to update.
 * @param {string} appleOriginalTransactionId - The new appleOriginalTransactionId value.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
export const updateAppleOriginalTransactionId = async (orderId: string, appleOriginalTransactionId: string) => {
    await db.update(order).set({ appleOriginalTransactionId }).where(eq(order.id, orderId));
};

/**
 * Updates the success status of an order by the Apple original transaction ID.
 * @param appleOriginalTransactionId - The Apple original transaction ID of the order.
 * @param expiredAt - The new expiration date of the order.
 */
export const updateOrderSuccessStatusByAppleTransactionId = async (
    appleOriginalTransactionId: string,
    expiredAt: Date,
) => {
    const date = new Date();

    await db
        .update(order)
        .set({ orderStatus: 'success', expiredAt: expiredAt, updatedAt: date })
        .where(eq(order.appleOriginalTransactionId, appleOriginalTransactionId));
};

/**
 * Updates the order status to 'cancelled' for a given Apple transaction ID.
 *
 * @param appleOriginalTransactionId - The Apple original transaction ID.
 */
export const updateOrderCancelledStatusByAppleTransactionId = async (appleOriginalTransactionId: string) => {
    const date = new Date();

    await db
        .update(order)
        .set({ orderStatus: 'cancelled', updatedAt: date })
        .where(and(eq(order.appleOriginalTransactionId, appleOriginalTransactionId), eq(order.orderStatus, 'success')));
};

/**
 * Updates the order status to 'expired' for a given Apple transaction ID.
 * @param appleOriginalTransactionId - The Apple original transaction ID.
 */
export const updateOrderExpiredStatusByAppleTransactionId = async (appleOriginalTransactionId: string) => {
    const date = new Date();

    await db
        .update(order)
        .set({ orderStatus: 'expired', updatedAt: date })
        .where(and(eq(order.appleOriginalTransactionId, appleOriginalTransactionId), eq(order.orderStatus, 'success')));
};

/**
 * Updates the order status and expiration date for a given order ID using Google Pay.
 * @param orderId - The ID of the order to update.
 * @returns The updated order object.
 */
export const updateOrderStatusGpay = async (orderId: string) => {
    const currentDate = new Date();

    currentDate.setMonth(currentDate.getMonth() + 1);

    await db.update(order).set({ orderStatus: 'success', expiredAt: currentDate }).where(eq(order.id, orderId));

    return order;
};

/**
 * Retrieves orders that are close to expiration.
 *
 * @returns {Promise<Array<any>>} A promise that resolves to an array of orders.
 */
export const getCloseToExpirationOrders = async () => {
    const orders = await db.execute(sql`
    SELECT id
    FROM "order"
    WHERE order_status = 'success'
    AND expired_at BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '3 days'
    AND payment_method = 'xendit';
    `);

    return orders;
};
