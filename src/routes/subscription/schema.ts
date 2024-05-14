import { z } from 'zod';

export const createCustomerSchema = z.object({
    body: z.object({
        reference_id: z.string().min(1, 'Please enter a reference ID'),
        given_names: z.string().min(1, 'Please enter a name'),
        email: z.string().email(),
        mobile_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number in E.164 format'),
    }),
});
