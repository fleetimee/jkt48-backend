import { z } from 'zod';

export const createOrderSchema = z.object({
    body: z.object({
        packageId: z.string().min(1, 'Package ID cannot be empty'),
    }),
});
