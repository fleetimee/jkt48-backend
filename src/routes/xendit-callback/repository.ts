import { eq } from 'drizzle-orm';

import db from '../../db';
import { order } from '../../models/order';
import { XenditRecurringStatus } from './api';

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

    await db
        .update(order)
        .set({ orderStatus: status, expiredAt: currentDate, callbackData: callbackData })
        .where(eq(order.id, orderId));
};

export const updateOrderStatusXenditSubscriptionCallback = async (
    orderId: string,
    status: XenditRecurringStatus,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callbackData: any,
) => {
    const currentDate = new Date();

    currentDate.setMonth(currentDate.getMonth() + 1);

    switch (status) {
        case XenditRecurringStatus.ACTIVATED:
            await db
                .update(order)
                .set({ orderStatus: 'success', expiredAt: currentDate, callbackData: callbackData })
                .where(eq(order.id, orderId));
            break;
        case XenditRecurringStatus.INACTIVATED:
            await db
                .update(order)
                .set({ orderStatus: 'failed', expiredAt: currentDate, callbackData: callbackData })
                .where(eq(order.id, orderId));
            break;
        case XenditRecurringStatus.CYCLE_CREATED:
            await db
                .update(order)
                .set({ orderStatus: 'success', expiredAt: currentDate, callbackData: callbackData })
                .where(eq(order.id, orderId));
            break;
        case XenditRecurringStatus.CYCLE_SUCCEED:
            await db
                .update(order)
                .set({ orderStatus: 'success', expiredAt: currentDate, callbackData: callbackData })
                .where(eq(order.id, orderId));
            break;
        case XenditRecurringStatus.CYCLE_RETRY:
            await db
                .update(order)
                .set({ orderStatus: 'pending', expiredAt: currentDate, callbackData: callbackData })
                .where(eq(order.id, orderId));
            break;
        case XenditRecurringStatus.CYCLE_FAILED:
            await db
                .update(order)
                .set({ orderStatus: 'failed', expiredAt: currentDate, callbackData: callbackData })
                .where(eq(order.id, orderId));
            break;
        default:
            throw new Error(`Invalid status: ${status}`);
    }
};
