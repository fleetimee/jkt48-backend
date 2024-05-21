import { z } from 'zod';

export const sendTokenSchema = z.object({
    body: z.object({
        fcmToken: z.string().min(1, 'Please enter a token'),
        model: z.string().optional(),
    }),
});

export const begoneTokenSchema = z.object({
    body: z.object({
        userId: z.string().optional(),
        model: z.string().optional(),
    }),
});
