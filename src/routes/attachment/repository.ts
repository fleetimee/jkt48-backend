import { eq } from 'drizzle-orm';

import db from '../../db';
import { message } from '../../models/message';
import { attachment } from '../../models/message_attachment';

export const getAllAttachmentsByConversationId = async (conversationId: string) => {
    // const attachments = await db.execute(sql`
    //     SELECT ma.file_path AS file_path
    //     FROM message m
    //             JOIN message_attachment ma ON m.id = ma.message_id
    //     WHERE m.conversation_id = ${conversationId};
    // `);

    const attachments = await db
        .select({
            filePath: attachment.filePath,
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
