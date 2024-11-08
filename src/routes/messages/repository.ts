import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { birthdayMessage } from '../../models/birthday_message';
import { message } from '../../models/message';
import { messageScheduled } from '../../models/message_scheduled';
import { NotFoundError } from '../../utils/errors';

/**
 * Retrieves the message reaction for a given message ID.
 * @param messageId The ID of the message.
 * @returns A Promise that resolves to the message reaction.
 */
export const getMessageReaction = async (messageId: string) => {
    const [reaction] = await db.execute(
        sql.raw(
            `
        SELECT r.emoji, COUNT(r.emoji) AS reaction_count
        FROM reaction r
                INNER JOIN message_reaction mr ON r.id = mr.reaction_id
        WHERE mr.message_id = '${messageId}'
        GROUP BY r.emoji;
        `,
        ),
    );

    return reaction;
};

/**
 * Retrieves the attachment for a given message ID.
 * @param messageId The ID of the message.
 * @returns The attachment object.
 */
export const getMessageAttachment = async (messageId: string) => {
    const [attachment] = await db.execute(
        sql.raw(
            `
        SELECT ma.id        AS attachment_id,
        ma.file_path AS file_path,
        ma.file_type AS file_type,
        ma.file_size AS file_size,
        ma.checksum  AS checksum,
        ma.created_at AS created_at
            FROM message_attachment ma
            WHERE ma.message_id = '${messageId}'
            `,
        ),
    );

    return attachment;
};

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
export const getMessages = async (userId: string, conversationId: string, limit: number, offset: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messages: any[] = [];

    await db.transaction(async trx => {
        messages = await trx.execute(sql`
        
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
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at
        LIMIT ${limit} OFFSET ${offset}
        `);

        await trx.execute(
            sql.raw(
                `
            INSERT INTO users_conversation (user_id, conversation_id, last_read_at)
                VALUES ('${userId}', '${conversationId}', NOW())
                ON CONFLICT (user_id, conversation_id) 
                DO UPDATE SET last_read_at = NOW()
            `,
            ),
        );
    });

    // If messages is empty, return it immediately
    if (messages.length === 0) {
        return messages;
    }

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
 * @returns The updated message item or null if the message was deleted.
 */
export const approveMessage = async (messageId: string, isApproved: boolean) => {
    if (isApproved) {
        const [messageItem] = await db.execute(
            sql`
        UPDATE message
        SET approved = ${isApproved}
        WHERE id = ${messageId}
        RETURNING *;
        `,
        );

        return messageItem;
    } else {
        await db.execute(
            sql`
        DELETE FROM message
        WHERE id = ${messageId};
        `,
        );

        return null;
    }
};

/**
 * Approves all messages from a specific user.
 * @param userUuid - The UUID of the user whose messages should be approved.
 * @returns The updated message items.
 */
export const approveAllUserMessages = async (conversationId: string) => {
    const [messageItems] = await db.execute(
        sql`
        UPDATE message
        SET approved = true
        WHERE conversation_id = ${conversationId}
        RETURNING id;
        `,
    );

    return messageItems;
};

export const getMessageDetail = async (messageId: string) => {
    const [messageItem] = await db.execute(
        sql`
        SELECT u.nickname AS nickname,
        u.profile_image AS profile_image,
        m.message  AS message
        FROM users u
                INNER JOIN message m ON u.id = m.user_id
        WHERE m.id = ${messageId};
        `,
    );

    return messageItem;
};

export const getAttachmentsByConversationId = async (conversationId: string) => {
    const attachments = await db.execute(
        sql.raw(
            `
        SELECT ma.file_path AS file_path
        FROM message m
        JOIN message_attachment ma ON m.id = ma.message_id
        WHERE m.conversation_id = '${conversationId}'
        `,
        ),
    );

    // Map over the attachments and extract the file_path
    const filePaths = attachments.map(attachment => attachment.file_path);

    return filePaths;
};

/**
 * Retrieves the birthday messages for a specific idol.
 * @param idolId - The ID of the idol.
 * @returns A Promise that resolves to an array of birthday messages.
 */
export const getBirthdayMessages = async (idolId: string) => {
    const [messages] = await db.select().from(birthdayMessage).where(eq(birthdayMessage.idolId, idolId));

    return messages;
};

/**
 * Inserts a birthday message into the database.
 *
 * @param {string} usersId - The ID of the user sending the message.
 * @param {string} idolId - The ID of the idol receiving the message.
 * @param {string} personalizedMessage - The personalized message to be sent.
 * @returns {Promise<void>} - A promise that resolves when the message is inserted.
 */
export const insertBirthdayMessage = async (usersId: string, idolId: string, personalizedMessage: string) => {
    const dateNow = new Date();
    dateNow.setHours(dateNow.getHours() + 7);

    await db.insert(messageScheduled).values({
        usersId,
        idolId,
        personalizedMessage,
        createdAt: dateNow,
        updatedAt: dateNow,
    });
};
