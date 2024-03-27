import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { conversation } from '../../models/conversation';

/**
 * Marks a conversation as read for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {string} conversationId - The ID of the conversation.
 * @returns {Promise<void>} - A promise that resolves when the conversation is marked as read.
 */
export const markConversationAsRead = async (userId: string, conversationId: string) => {
    await db.execute(
        sql.raw(
            `
        UPDATE users_conversation
        SET last_read_at = now()
        WHERE user_id = '${userId}' AND conversation_id = '${conversationId}'
        `,
        ),
    );
};

/**
 * Retrieves conversations with optional search query, limited by a specified number and offset.
 * @param limit - The maximum number of conversations to retrieve.
 * @param offset - The number of conversations to skip before starting to retrieve.
 * @param searchQuery - The optional search query to filter conversations by user nickname.
 * @returns A promise that resolves to an array of conversations.
 */
export const getConversations = async (limit: number, offset: number, searchQuery?: string) => {
    let whereClause = '';
    if (searchQuery) {
        whereClause = `WHERE u.nickname ILIKE '%${searchQuery}%'`;
    }

    const conversation = await db.execute(
        sql.raw(
            `
        SELECT DISTINCT ON (i.id)
        c.id        AS conversation_id,
        u.id         AS user_id,
                          i.id         AS idol_id,
                          u.nickname   AS idol_name,
                          U.name       AS idol_name,
                          u.profile_image,
                          m.message    AS last_message,
                          m.created_at AS last_message_time
        FROM conversation c
                LEFT JOIN idol i ON c.idol_id = i.id
                LEFT JOIN users u ON i.user_id = u.id
                LEFT JOIN message m ON c.id = m.conversation_id
        ${whereClause}
        ORDER BY i.id, m.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
        `,
        ),
    );

    return conversation;
};

/**
 * Retrieves conversations by conversation ID.
 * @param conversationId - The ID of the conversation.
 * @returns A Promise that resolves to the conversation data.
 */
export const getConversationsById = async (conversationId: string) => {
    const conversation = await db.execute(
        sql.raw(
            `
        SELECT DISTINCT ON (i.id) u.id         AS user_id,
                          i.id         AS idol_id,
                          u.nickname   AS idol_name,
                          U.name       AS idol_name,
                          u.profile_image,
                          m.message    AS last_message,
                          m.created_at AS last_message_time
        FROM conversation c
                LEFT JOIN idol i ON c.idol_id = i.id
                LEFT JOIN users u ON i.user_id = u.id
                LEFT JOIN message m ON c.id = m.conversation_id
        WHERE c.id = '${conversationId}'
        ORDER BY i.id, m.created_at DESC
        `,
        ),
    );

    return conversation;
};

export const getSimpleConversationById = async (conversationId: string) => {
    const [conversationItem] = await db.select().from(conversation).where(eq(conversation.id, conversationId));

    return conversationItem;
};
