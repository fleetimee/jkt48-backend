import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { message } from '../../models/message';
import { NotFoundError } from '../../utils/errors';

/**
 * Retrieves the reactions for the given message IDs.
 * @param messageIds An array of message IDs.
 * @returns A Promise that resolves to an array of reaction objects.
 */
export const getMessageReactions = async (messageIds: string[]) => {
    const reactions = await db.execute(
        sql.raw(
            `
        SELECT r.emoji, COUNT(r.emoji) AS reaction_count, mr.message_id
        FROM reaction r
                INNER JOIN message_reaction mr ON r.id = mr.reaction_id
        WHERE mr.message_id IN (${messageIds.map(id => `'${id}'`).join(',')})
        GROUP BY r.emoji, mr.message_id;
        `,
        ),
    );

    return reactions;
};

/**
 * Retrieves message attachments based on the provided message IDs.
 * @param messageIds - An array of message IDs.
 * @returns A Promise that resolves to an array of message attachments.
 */
export const getMessageAttachments = async (messageIds: string[]) => {
    const attachments = await db.execute(
        sql.raw(
            `
        SELECT ma.id        AS attachment_id,
        ma.file_path AS file_path,
        ma.file_type AS file_type,
        ma.file_size AS file_size,
        ma.checksum  AS checksum,
        ma.created_at AS created_at,
        ma.message_id AS message_id
            FROM message_attachment ma
            WHERE ma.message_id IN (${messageIds.map(id => `'${id}'`).join(',')})
            `,
        ),
    );

    return attachments;
};

/**
 * Retrieves messages from the database based on the conversation ID, limit, and offset.
 * @param conversationId - The ID of the conversation.
 * @param limit - The maximum number of messages to retrieve.
 * @param offset - The number of messages to skip before retrieving.
 * @returns A Promise that resolves to an array of messages.
 */
export const getMessages = async (conversationId: string, limit: number, offset: number) => {
    const messages = await db.execute(
        sql.raw(
            `
       SELECT m.id         AS message_id,
       m.message    AS message,
       m.created_at AS created_at,
       u2.name      AS idol_name,
       u2.nickname  AS idol_nickname,
       m.approved  AS approved
        FROM message m
                INNER JOIN users u ON m.user_id = u.id
                INNER JOIN conversation c ON m.conversation_id = c.id
                INNER JOIN idol i ON c.idol_id = i.id
                INNER JOIN users u2 ON i.user_id = u2.id
        WHERE conversation_id = '${conversationId}'
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
        `,
        ),
    );

    const messageIds = messages.map(message => message.message_id);
    const reactions = await getMessageReactions(messageIds as string[]);
    const attachments = await getMessageAttachments(messageIds as string[]);

    for (const message of messages) {
        message.reactions = reactions
            .filter(reaction => reaction.message_id === message.message_id)
            .map(reaction => ({ ...reaction, reaction_count: parseInt(reaction.reaction_count as string, 10) }));

        message.attachments = attachments.filter(attachment => {
            attachment.file_size = Number(attachment.file_size);
            return attachment.message_id === message.message_id;
        });
    }

    return messages;
};

/**
 * Retrieves messages by their ID from the database.
 * @param messageId - The ID of the message to retrieve.
 * @returns A Promise that resolves to the retrieved messages.
 */
export const getMessagesById = async (messageId: string) => {
    const [messageItem] = await db.select().from(message).where(eq(message.id, messageId));

    if (!messageItem) {
        throw new NotFoundError('Message not found');
    }

    return messageItem;
};

/**
 * Creates a new message in the database.
 * @param conversationId - The ID of the conversation the message belongs to.
 * @param userId - The ID of the user who sent the message.
 * @param message - The content of the message.
 * @param attachments - Optional array of attachments associated with the message.
 */
export const createMessage = async (
    conversationId: string,
    userId: string,
    message: string,
    attachments?: Array<{ filePath: string; fileType: string; fileSize: number; checksum: string }>,
) => {
    await db.transaction(async trx => {
        const [messageId] = await trx.execute(sql`
        INSERT INTO message (message, created_at, user_id, conversation_id)
        VALUES (${message}, NOW(), ${userId}, ${conversationId})
        RETURNING id;
        `);

        if (attachments) {
            console.log('attachments', attachments);

            for (const attachment of attachments) {
                await trx.execute(sql`
                INSERT INTO message_attachment (message_id, file_path, file_type, created_at, file_size, checksum)
                VALUES (${messageId.id}, ${attachment.filePath}, ${attachment.fileType}, NOW(), ${attachment.fileSize}, ${attachment.checksum});
                `);
            }
        }
    });
};

/**
 * Deletes a message from the database.
 * @param {string} messageId - The ID of the message to delete.
 * @returns {Promise<void>} - A promise that resolves when the message is deleted.
 */
export const deleteMessage = async (messageId: string) => {
    await db.delete(message).where(eq(message.id, messageId));
};

/**
 * Approves or disapproves a message.
 * @param messageId - The ID of the message to be approved or disapproved.
 * @param isApproved - A boolean indicating whether the message should be approved or disapproved.
 * @returns The updated message item.
 */
export const approveMessage = async (messageId: string, isApproved: boolean) => {
    const [messageItem] = await db.execute(
        sql`
    UPDATE message
    SET approved = ${isApproved}
    WHERE id = ${messageId}
    RETURNING *;
    `,
    );

    return messageItem;
};
