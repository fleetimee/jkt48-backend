import { z } from 'zod';

export const createNewsSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Please enter a title'),
        body: z.string().min(1, 'News body cannot be empty'),
        image: z.string().optional(),
    }),
});

export const updateNewsSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Please enter a title'),
        body: z.string().min(1, 'News body cannot be empty'),
        image: z.string().optional(),
    }),
});
