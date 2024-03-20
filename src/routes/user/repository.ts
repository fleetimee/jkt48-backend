import bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { order } from '../../models/order';
import { users } from '../../models/users';
import { getMessageAttachments, getMessageReactions } from '../messages/repository';

/**
 * Retrieves a user by their ID.
 * @param id - The ID of the user.
 * @returns The user object.
 */
export const getUserById = async (id: string) => {
    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            nickname: users.nickName,
            birthday: users.birthday,
            profileImage: users.profileImage,
            role: users.roles,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    return user;
};

/**
 * Updates a user's information in the database.
 * @param id - The ID of the user to update.
 * @param email - The updated email of the user.
 * @param nickName - The updated nickname of the user.
 * @param name - The updated name of the user.
 * @param birthday - The updated birthday of the user.
 * @param profileImage - The updated profile image of the user.
 * @returns The updated user object.
 */
export const updateUser = async (
    id: string,
    email: string,
    nickName: string,
    name: string,
    birthday: Date,
    profileImage: string,
) => {
    const currentDate = new Date();

    const [user] = await db
        .update(users)
        .set({ email, nickName, name, birthday, profileImage, updatedAt: currentDate })
        .where(eq(users.id, id))
        .returning();

    return user;
};

/**
 * Updates the email and password of a user.
 * @param userId - The ID of the user.
 * @param email - The new email for the user.
 * @param password - The new password for the user.
 * @returns The updated user object.
 */
export const updateEmailAndPassword = async (userId: string, email: string, password: string) => {
    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.update(users).set({ email, passwordHash }).where(eq(users.id, userId));

    return user;
};

/**
 * Counts the number of registered users who have verified their email and have the role of 'user'.
 * @returns {Promise<number>} The count of registered users.
 */
export const countRegisteredUsers = async () => {
    const [count] = await db.execute(sql`
    SELECT COUNT(*)
    FROM users
    WHERE email_verified = TRUE
    AND roles = 'user';
    `);

    return count;
};

/**
 * Counts the number of active subscriptions users.
 * An active subscription user is defined as a user who has a successful order with an expiration date in the future.
 *
 * @returns {Promise<number>} The count of active subscriptions users.
 */
export const countActiveSubscriptionsUsers = async () => {
    const [count] = await db.execute(sql`
    SELECT COUNT(*)
    FROM users
    WHERE id IN (SELECT user_id
                FROM "order"
                WHERE order_status = 'success'
                AND expired_at > NOW());
    `);

    return count;
};

/**
 * Checks the user's subscription status.
 * @param userId - The ID of the user.
 * @returns A Promise that resolves to the user's subscription details.
 */
export const checkUserSubscription = async (userId: string) => {
    const [subscription] = await db.execute(sql`
    SELECT o.id          AS order_id,
       p.name        AS package_name,
       p.description AS package_description,
       o.expired_at  AS expired_at
    FROM "order" o
            INNER JOIN package p ON o.package_id = p.id
    WHERE o.user_id = ${userId}
    AND o.order_status = 'success'
    AND o.expired_at > NOW();
    `);

    return subscription;
};

/**
 * Checks if a user has a subscription to a specific idol.
 * @param userId - The ID of the user.
 * @param idolId - The ID of the idol.
 * @returns A boolean indicating whether the user has a subscription to the idol.
 */
export const checkUserSubscriptionOderIdol = async (userId: string, idolId: string) => {
    const [subscription] = await db.execute(sql`
    SELECT EXISTS (SELECT 1
                FROM "order" o
                            INNER JOIN package p ON o.package_id = p.id
                WHERE o.user_id = ${userId}
                    AND o.order_status = 'success'
                    AND o.expired_at > NOW()
                    AND o.id IN (SELECT order_id
                                FROM order_idol
                                WHERE idol_id = ${idolId})) AS order_exists;
    `);

    return subscription;
};

/**
 * Cancels the subscription for a user.
 * @param userId - The ID of the user.
 * @returns The updated subscription object.
 */
export const cancelSubscription = async (userId: string) => {
    const [subscription] = await db
        .update(order)
        .set({ orderStatus: 'failed' })
        .where(eq(order.userId, userId))
        .returning();

    return subscription;
};

/**
 * Retrieves the transaction list for a specific user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of transactions.
 */
export const getUserTransactionList = async (userId: string) => {
    const transactions = await db.execute(sql`
    SELECT o.id           AS order_id,
        p.name         AS package_name,
        o.created_at   AS order_date,
        o.total        AS order_total,
        o.order_status AS order_status
    FROM "order" o
            INNER JOIN package p ON o.package_id = p.id
    WHERE o.user_id = ${userId}
    ORDER BY o.created_at DESC;
    `);

    return transactions;
};

/**
 * Retrieves the transaction details for a specific user and order.
 * @param userId - The ID of the user.
 * @param orderId - The ID of the order.
 * @returns A Promise that resolves to the transaction details.
 */
export const getUserTransactionDetail = async (userId: string, orderId: string) => {
    const [transaction] = await db.execute(sql`
    SELECT o.id             AS order_id,
        p.name           AS package_name,
        o.total          AS order_total,
        o.order_status   AS order_status,
        1                AS quantity,
        o.subtotal       AS subtotal,
        o.tax            AS tax,
        o.payment_method AS payment_method,
        o.created_at     AS order_date,
        o.expired_at     AS expired_at,
        o.callback_data AS callback_data
    FROM "order" o
            INNER JOIN package p ON o.package_id = p.id
    WHERE o.user_id = ${userId}
    AND o.id = ${orderId};
    `);

    return transaction;
};

/**
 * Retrieves the list of conversations for a given user.
 *
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the list of conversations.
 */
export const getUserConversationList = async (userId: string) => {
    const conversation = await db.execute(sql`
  SELECT *
        FROM (
            SELECT DISTINCT ON (i.id)
            c.id            AS conversation_id,
            u.id            AS user_id,
            i.id            AS idol_id,
            u.nickname      AS idol_name,
            U.profile_image AS idol_image,
            m.message       AS last_message,
            m.created_at    AS last_message_time,
            (
                SELECT COUNT(*)
                FROM message
                WHERE conversation_id = c.id AND (
                    created_at > (
                        SELECT last_read_at
                        FROM users_conversation
                        WHERE user_id = ${userId} AND conversation_id = c.id
                    ) OR (
                        SELECT last_read_at
                        FROM users_conversation
                        WHERE user_id = ${userId} AND conversation_id = c.id
                    ) IS NULL
                )
            ) AS unread_count
            FROM order_idol
                INNER JOIN "order" o ON order_idol.order_id = o.id
                INNER JOIN idol i ON order_idol.idol_id = i.id
                INNER JOIN conversation c ON i.id = c.idol_id
                INNER JOIN users u ON i.user_id = u.id
                LEFT JOIN message m ON c.id = m.conversation_id
            WHERE o.user_id = ${userId}
            AND o.order_status = 'success'
            ORDER BY i.id, m.created_at DESC
        ) AS subquery
        ORDER BY unread_count DESC, idol_name;
    `);

    return conversation;
};

/**
 * Retrieves the messages of a user in a specific conversation.
 *
 * @param userId - The ID of the user.
 * @param conversationId - The ID of the conversation.
 * @param limit - The maximum number of messages to retrieve.
 * @param offset - The number of messages to skip before retrieving.
 * @returns A promise that resolves to an array of messages.
 */
export const getUserConversationMessages = async (
    userId: string,
    conversationId: string,
    limit: number,
    offset: number,
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messages: any[] = [];

    console.log(userId, conversationId, limit, offset);

    await db.transaction(async trx => {
        // Fetch the conversation messages
        messages = await trx.execute(sql`
        SELECT m.id         AS message_id,
            m.message    AS message,
            m.created_at AS created_at,
            i.id         AS idol_id,
            u2.name      AS idol_name,
            u2.nickname  AS idol_nickname,
            m.approved  AS approved
        FROM message m
                INNER JOIN users u ON m.user_id = u.id
                INNER JOIN conversation c ON m.conversation_id = c.id
                INNER JOIN idol i ON c.idol_id = i.id
                INNER JOIN users u2 ON i.user_id = u2.id
        WHERE c.id = ${conversationId}
        AND m.approved = TRUE
        ORDER BY m.created_at 
        LIMIT ${limit} OFFSET ${offset};
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
 * Retrieves the active idols for a given user.
 * @param userId The ID of the user.
 * @returns A Promise that resolves to an array of active idols.
 */
export const getUserActiveIdols = async (userId: string) => {
    const [idols] = await db.execute(sql`
    SELECT i.id            AS idol_id,
        u.id            AS user_id,
        u.nickname      AS idol_name,
        u.profile_image AS idol_image
    FROM order_idol
            INNER JOIN "order" o ON order_idol.order_id = o.id
            INNER JOIN idol i ON order_idol.idol_id = i.id
            INNER JOIN users u ON i.user_id = u.id
    WHERE o.user_id = ${userId}
    AND o.order_status = 'success'
    AND o.expired_at > now();
    `);

    return idols;
};

/**
 * Inserts a user's reaction to a message into the database.
 *
 * @param {string} userId - The ID of the user reacting to the message.
 * @param {string} messageId - The ID of the message being reacted to.
 * @param {string} reaction - The reaction being added by the user.
 * @returns {Promise<any>} - A promise that resolves to the inserted message reaction.
 */
export const postUserReactToMessage = async (userId: string, messageId: string, reactionId: string) => {
    const [message] = await db.execute(sql`
    INSERT INTO message_reaction (users_id, message_id, reaction_id)
    VALUES (${userId}, ${messageId}, ${reactionId})
    RETURNING *;
    `);

    return message;
};

/**
 * Deletes a user's reaction to a message.
 * @param userId - The ID of the user.
 * @param messageId - The ID of the message.
 * @param reactionId - The ID of the reaction.
 * @returns The deleted message.
 */
export const deleteUserReactToMessage = async (userId: string, messageId: string, reactionId: string) => {
    const [message] = await db.execute(sql`
    DELETE FROM message_reaction
    WHERE users_id = ${userId}
    AND message_id = ${messageId}
    AND reaction_id = ${reactionId}
    RETURNING *;
    `);

    return message;
};
