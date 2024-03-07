import { eq } from 'drizzle-orm';

import db from '../../db';
import { order } from '../../models/order';

/**
 * Updates the order status for Xendit callback.
 * @param orderId - The ID of the order.
 * @param status - The new status of the order.
 * @throws Error if the status is invalid.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateOrderStatusXenditCallback = async (orderId: string, status: string, callbackData: any) => {
    if (status !== 'pending' && status !== 'success' && status !== 'failed') {
        throw new Error(`Invalid status: ${status}`);
    }

    const currentDate = new Date();

    currentDate.setMonth(currentDate.getMonth() + 1);

    console.log('currentDate', currentDate);

    await db
        .update(order)
        .set({ orderStatus: status, expiredAt: currentDate, callbackData: callbackData })
        .where(eq(order.id, orderId));
};
