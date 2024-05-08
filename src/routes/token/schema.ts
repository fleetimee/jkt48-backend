import { z } from 'zod';

export const sendTokenSchema = z.object({
    body: z.object({
        fcmToken: z.string().min(1, 'Please enter a token'),
    }),
});
