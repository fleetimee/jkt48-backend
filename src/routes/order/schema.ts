import { z } from 'zod';

export const createOrderSchema = z.object({
    body: z.object({
        packageId: z.string().min(1, 'Package ID cannot be empty'),
        paymentMethod: z.enum(['xendit', 'midtrans', 'gopay', 'ovo', 'dana', 'google_pay', 'apple_pay']),
        subtotal: z.number().min(1, 'Subtotal cannot be empty'),
        tax: z.number().min(1, 'Tax cannot be empty'),
        total: z.number().min(1, 'Total cannot be empty'),
        idolIds: z.array(z.string()).optional(),
    }),
});

export const updateOrderStatusSchema = z.object({
    body: z.object({
        orderId: z.string().min(1, 'Order ID cannot be empty'),
    }),
});

export const updateAppleOriginalTransactionIdSchema = z.object({
    body: z.object({
        orderId: z.string().min(1, 'Order ID cannot be empty'),
        appleOriginalTransactionId: z.string().min(1, 'Apple Original Transaction ID cannot be empty'),
    }),
});

export const updateGooglePurchaseTokenSchema = z.object({
    body: z.object({
        orderId: z.string().min(1, 'Order ID cannot be empty'),
        googlePurchaseToken: z.string().min(1, 'Google Purchase Token cannot be empty'),
        googlePurchaseId: z.string().min(1, 'Google Purchase ID cannot be empty'),
    }),
});
