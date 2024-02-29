import { sql } from 'drizzle-orm';

import db from '../../db';

interface GetConversationProps {
    limit: number;
    offset: number;

    searchQuery?: string;
}

export const getConversations = async ({ limit, offset, searchQuery }: GetConversationProps) => {
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
