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
