import { z } from 'zod';

export const createInvoiceSchema = z.object({
    body: z.object({
        idOrder: z.string().min(1, 'External ID must be at least 1 character long'),
        amount: z.number().min(1, 'Amount must be at least 1').optional(),
        currency: z.string().min(1, 'Currency must be at least 1 character long'),
        description: z.string().min(1, 'Description must be at least 1 character long').optional(),
        customer: z
            .object({
                givename: z.string().optional(),
                surname: z.string().optional(),
                email: z.string().email('Invalid email').optional(),
                mobile_number: z.string().optional(),
            })
            .optional(),
        customerNotificationPreferences: z
            .object({
                invoicePaid: z.array(z.string()).optional(),
            })
            .optional(),
        successRedirectUrl: z.string().url('Invalid URL').optional(),
        failureRedirectUrl: z.string().url('Invalid URL').optional(),
        items: z
            .array(
                z.object({
                    name: z.string().optional(),
                    quantity: z.number().optional(),
                    amount: z.number().optional(),
                    category: z.string().optional(),
                }),
            )
            .optional(),
        fees: z
            .array(
                z.object({
                    type: z.string().optional(),
                    value: z.number().optional(),
                }),
            )
            .optional(),
    }),
});
