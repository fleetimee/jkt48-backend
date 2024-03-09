import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        email: z.string().email('Please enter a valid email'),
        nickName: z.string().min(1, 'Please enter a nickname'),
        name: z.string().min(1, 'Please enter a name'),
        birthday: z.string().optional(),
        profileImage: z.string().optional(),
    }),
});

export const postReaction = z.object({
    body: z.object({
        reactionId: z.string().uuid('Please enter a valid reaction ID'),
    }),
});
