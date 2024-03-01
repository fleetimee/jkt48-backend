import { z } from 'zod';

export const createMessageSchema = z.object({
    body: z.object({
        conversationId: z.string().min(1, 'Please enter a conversation id'),
        userId: z.string().min(1, 'Please enter a user id'),
        message: z.string().min(1, 'Message cannot be empty'),
        attachments: z.array(z.string()).optional(),
    }),
});
