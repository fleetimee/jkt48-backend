import { z } from 'zod';

export const createIdolSchema = z.object({
    body: z.object({
        email: z.string().email().min(1),
        password: z.string().min(8),
        fullName: z.string().min(1),
        nickname: z.string().min(1),
        birthday: z.string().refine(value => !isNaN(new Date(value).getTime()), {
            message: 'Please enter a valid date',
            path: ['birthday'],
        }),
        height: z.string(),
        bloodType: z.string(),
        horoscope: z.string(),
        xUrl: z.string(),
        instagramUrl: z.string(),
    }),
});

export const updateIdolSchema = z.object({
    body: z.object({
        email: z.string().email().min(1),
        fullName: z.string().min(1),
        nickname: z.string().min(1),
        birthday: z.string().refine(value => !isNaN(new Date(value).getTime()), {
            message: 'Please enter a valid date',
            path: ['birthday'],
        }),
        height: z.string(),
        bloodType: z.string(),
        horoscope: z.string(),
    }),
});

export const updateLoggedOnIdolSchema = z.object({
    body: z.object({
        fullName: z.string().optional(),
        bio: z.string().optional(),
    }),
});
