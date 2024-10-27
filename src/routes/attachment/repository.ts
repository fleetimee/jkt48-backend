import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { attachment } from '../../models/message_attachment';

/**
 * Retrieves all attachments associated with a conversation.
 * @param conversationId - The ID of the conversation.
 * @returns A Promise that resolves to an array of attachments.
 */
export const getAllAttachmentsByConversationId = async (conversationId: string, userId: string) => {
    const attachments = await db.execute(sql`
        SELECT ma.file_path, ma.created_at
        FROM message_attachment ma
        INNER JOIN message m ON m.id = ma.message_id
        INNER JOIN conversation c ON c.id = m.conversation_id
        WHERE (ma.file_path LIKE '%.jpg'
        OR ma.file_path LIKE '%.png'
        OR ma.file_path LIKE '%.gif'
        OR ma.file_path LIKE '%.bmp'
        OR ma.file_path LIKE '%.tiff'
        OR ma.file_path LIKE '%.ico'
        OR ma.file_path LIKE '%.webp')
        AND m.approved = TRUE
        AND c.id = ${conversationId}
        AND m.created_at > (SELECT created_at FROM users WHERE id = ${userId})
        ORDER BY ma.created_at DESC;
    `);

    return attachments.map(attachment => ({
        filePath: attachment.file_path,
        createdAt: attachment.created_at,
    }));
};

/**
 * Retrieves attachments by message ID.
 * @param messageId - The ID of the message.
 * @returns A promise that resolves to an array of attachments.
 */
export const getAttachmentsByMessageId = async (messageId: string) => {
    const attachments = await db.select().from(attachment).where(eq(attachment.messageId, messageId));

    return attachments;
};

/**
 * Deletes an attachment from the database.
 * @param attachmentId - The ID of the attachment to delete.
 */
export const deleteAttachment = async (attachmentId: string) => {
    await db.delete(attachment).where(eq(attachment.id, attachmentId));

    return;
};
