import { eq } from 'drizzle-orm';

import db from '../../db';
import { message } from '../../models/message';
import { attachment } from '../../models/message_attachment';

/**
 * Retrieves all attachments associated with a conversation.
 * @param conversationId - The ID of the conversation.
 * @returns A Promise that resolves to an array of attachments.
 */
export const getAllAttachmentsByConversationId = async (conversationId: string) => {
    const attachments = await db
        .select({
            filePath: attachment.filePath,
            createdAt: attachment.createdAt,
        })
        .from(message)
        .innerJoin(attachment, eq(message.id, attachment.messageId))
        .where(eq(message.conversationId, conversationId));

    return attachments;
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
