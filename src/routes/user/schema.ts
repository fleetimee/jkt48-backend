import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        email: z.string().email('Please enter a valid email').optional(),
        nickName: z.string().min(1, 'Please enter a nickname').optional(),
        name: z.string().min(1, 'Please enter a name').optional(),
        birthday: z.date().optional(),
        profileImage: z.string().optional(),
    }),
});
