import { z } from 'zod';

export const createCustomerSchema = z.object({
    body: z.object({
        reference_id: z.string().min(1, 'Please enter a reference ID'),
        given_names: z.string().min(1, 'Please enter a name'),
        email: z.string().email(),
    }),
});
