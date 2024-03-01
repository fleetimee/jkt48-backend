import { sql } from 'drizzle-orm';

import db from '../../db';

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

export const getMessages = async (conversationId: string, limit: number, offset: number) => {
    const messages = await db.execute(
        sql.raw(
            `
       SELECT m.id         AS message_id,
       m.message    AS message,
       m.created_at AS created_at,
       u2.name      AS idol_name,
       u2.nickname  AS idol_nickname
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
