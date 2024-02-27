import { z } from 'zod';

export const updatePackageSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Please enter a name').optional(),
        description: z.string().min(1, 'Please enter a description').optional(),
        totalMembers: z.string().min(1, 'Please enter a total members').optional(),
        price: z.string().min(1, 'Please enter a price').optional(),
        isActive: z.boolean().optional(),
    }),
});
