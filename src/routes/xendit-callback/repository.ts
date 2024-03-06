import { eq } from 'drizzle-orm';

import db from '../../db';
import { order } from '../../models/order';

/**
 * Updates the order status for Xendit callback.
 * @param orderId - The ID of the order.
 * @param status - The new status of the order.
 * @throws Error if the status is invalid.
 */
export const updateOrderStatusXenditCallback = async (orderId: string, status: string) => {
    if (status !== 'pending' && status !== 'success' && status !== 'failed') {
        throw new Error(`Invalid status: ${status}`);
    }

    await db.update(order).set({ orderStatus: status }).where(eq(order.id, orderId));
};
