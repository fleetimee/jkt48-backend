import { sql } from 'drizzle-orm';

import db from '../../db';

/**
 * Sends the FCM token to the server and updates the last accessed time.
 * If the token doesn't exist, it will be inserted into the database.
 * If the token already exists, the last accessed time will be updated.
 * @param {string} token - The FCM token to send.
 * @param {string} userId - The user ID associated with the token.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export const sendTokenToServer = async (token: string, userId: string, model: string) => {
    const [existingToken] = await db.execute(
        sql`
        SELECT * FROM fcm_token WHERE token = ${token} AND user_id = ${userId}
        `,
    );

    const currentTime = new Date();

    if (!existingToken) {
        await db.execute(
            sql`
            INSERT INTO fcm_token (token, user_id, last_accessed, model)
            VALUES (${token}, ${userId}, ${currentTime}, ${model})
            `,
        );
    } else {
        await db.execute(
            sql`
            UPDATE fcm_token SET last_accessed = ${currentTime}, model = ${model} WHERE token = ${token} AND user_id = ${userId}
            `,
        );
    }
};

/**
 * Fetches all FCM tokens for admin users.
 * @returns {Promise<string[]>} A promise that resolves to an array of FCM tokens.
 */
export const fetchAllAdminFcmToken = async () => {
    const tokens = await db.execute(
        sql`
        SELECT token
        FROM fcm_token ft
                INNER JOIN users u ON ft.user_id = u.id
        WHERE u.roles = 'admin';
        `,
    );

    return tokens;
};

/**
 * Fetches the subscribed FCM tokens based on a given message ID.
 * @param messageId - The ID of the message.
 * @returns A Promise that resolves to an array of FCM tokens.
 */
export const fetchSubscribedFcmTokens = async (messageId: string) => {
    const tokens = await db.execute(
        sql`
        SELECT token
        FROM fcm_token
        WHERE user_id IN (SELECT DISTINCT o.user_id
                        FROM order_idol oi
                                INNER JOIN "order" o ON oi.order_id = o.id
                                INNER JOIN idol i ON oi.idol_id = i.id
                                INNER JOIN conversation c ON i.id = c.idol_id
                                INNER JOIN message m ON c.id = m.conversation_id
                        WHERE o.order_status = 'success'
                            AND o.expired_at > NOW()
                            AND m.id = ${messageId});
        `,
    );

    return tokens;
};

export const deleteStaleFcmTokens = async () => {
    const currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - 30);

    await db.execute(
        sql`
        DELETE FROM fcm_token WHERE last_accessed < ${currentTime}
        `,
    );
};
