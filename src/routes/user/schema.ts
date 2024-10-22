import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        email: z.string().email('Please enter a valid email'),
        nickName: z.string().min(1, 'Please enter a nickname').max(64, 'Nickname cannot exceed 64 characters'),
        name: z.string().min(1, 'Please enter a name').max(100, 'Name cannot exceed 100 characters'),
        birthday: z.string().optional(),
        profileImage: z.string().optional(),
    }),
});

export const postReaction = z.object({
    body: z.object({
        reactionId: z.string().uuid('Please enter a valid reaction ID'),
    }),
});
