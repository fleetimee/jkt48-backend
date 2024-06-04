import { z } from 'zod';

export const createMessageSchema = z.object({
    body: z.object({
        conversationId: z.string().min(1, 'Conversation ID cannot be empty'),
        messages: z.string().min(1, 'Message cannot be empty'),
        attachments: z
            .array(
                z.object({
                    file_path: z.string().min(1, 'Please enter a file path'),
                    file_type: z.string().min(1, 'Please enter a file type'),
                    file_size: z.number().min(1, 'Please enter a file size'),
                    checksum: z.string().min(1, 'Please enter a checksum'),
                }),
            )
            .optional(),
    }),
});

export const approveOrRejectMessageSchema = z.object({
    body: z.object({
        isApproved: z.boolean(),
    }),
});

export const approveAllMessagesSchema = z.object({
    body: z.object({
        conversationId: z.string().min(1, 'Conversation ID cannot be empty'),
    }),
});

export const insertBirthdayMessageSchema = z.object({
    body: z.object({
        userId: z.string().min(1, 'User ID cannot be empty'),
        idolId: z.string().min(1, 'Idol ID cannot be empty'),
        personalizedMessage: z.string().min(1, 'Personalized message cannot be empty'),
    }),
});
