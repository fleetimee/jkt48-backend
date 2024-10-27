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
        SELECT m.id         AS message_id,
                m.message    AS message,
                m.created_at AS created_at,
                i.id         AS idol_id,
                u2.name      AS idol_name,
                u2.nickname  AS idol_nickname,
                m.approved   AS approved
            FROM message m
            INNER JOIN users u ON m.user_id = u.id
            INNER JOIN conversation c ON m.conversation_id = c.id
            INNER JOIN idol i ON c.idol_id = i.id
            INNER JOIN users u2 ON i.user_id = u2.id
            INNER JOIN "order" o ON o.user_id = ${userId}
            INNER JOIN (
                SELECT user_id, MAX(updated_at) AS last_successful_order
                FROM "order"
                WHERE user_id = ${userId} AND order_status = 'success'
                GROUP BY user_id
            ) AS last_order ON o.user_id = last_order.user_id
            WHERE c.id = ${conversationId}
            AND m.approved = TRUE
            AND m.created_at > last_order.last_successful_order
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
