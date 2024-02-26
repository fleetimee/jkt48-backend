import { z } from 'zod';

export const createNewsSchema = z.object({
    body: z.object({}),
});
