import { sql } from 'drizzle-orm';

import db from '../../db';

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
