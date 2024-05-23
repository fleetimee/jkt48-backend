import { z } from 'zod';

export const appleVerifySchema = z.object({
    body: z.object({
        receiptData: z.string().min(1, 'Please enter your receipt'),
    }),
});
