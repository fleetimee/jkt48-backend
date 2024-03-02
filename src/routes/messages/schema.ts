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
