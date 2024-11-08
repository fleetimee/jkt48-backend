import bcrypt from 'bcrypt';
import { and, eq, sql } from 'drizzle-orm';

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
            xenditCustomerId: users.xenditCustomerId,
            email: users.email,
            name: users.name,
            nickname: users.nickName,
            birthday: users.birthday,
            profileImage: users.profileImage,
            role: users.roles,
            phoneNumber: users.phoneNumber,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    return user;
};

export const isEmailExist = async (email: string): Promise<boolean> => {
    const [user] = await db
        .select({
            email: users.email,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return user ? true : false;
};

/**
 * Retrieves a user by their ID along with the count of unread news.
 * @param id - The ID of the user.
 * @returns A Promise that resolves to the user object with the unread news count.
 */
export const getUserByIdWithUnreadNewsCount = async (id: string) => {
    const [user] = await db.execute(sql`
    WITH unread_news AS (SELECT COUNT(*) AS unread_news_count
                     FROM news n
                     WHERE n.created_at > (SELECT last_read_at
                                           FROM users_news
                                           WHERE user_id = ${id})
                        OR (SELECT last_read_at
                            FROM users_news
                            WHERE user_id = ${id}) IS NULL)
    SELECT 
        unread_news.unread_news_count,
        CASE
            WHEN unread_news.unread_news_count = 0 THEN TRUE
            ELSE FALSE
            END         AS is_news_read
    FROM users u,
        unread_news
    WHERE u.id = ${id};
    `);

    return user;
};

/**
 * Retrieves the user ID along with the count of unread birthday messages for the given user ID.
 * @param id - The ID of the user.
 * @returns A Promise that resolves to the user object containing the unread birthday message count and a flag indicating if the birthday message is read.
 */
export const getUserIdWithUnreadBirthdayMessageCount = async (id: string) => {
    const [user] = await db.execute(sql`
    WITH unread_birthday AS (
        SELECT COUNT(*) AS unread_birthday_count
        FROM message_scheduled ms
        WHERE ms.users_id = ${id}
            AND (ms.created_at > (SELECT last_read_at
                                FROM users_birthday
                                WHERE user_id = ${id})
                OR (SELECT last_read_at
                    FROM users_birthday
                    WHERE user_id = ${id}) IS NULL)
    )
    SELECT unread_birthday.unread_birthday_count,
        CASE
            WHEN unread_birthday.unread_birthday_count = 0 THEN TRUE
            ELSE FALSE
        END AS is_birthday_message_read
    FROM users u,
        unread_birthday
    WHERE u.id = ${id};
    `);

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
    profileImage: string | null,
) => {
    const currentDate = new Date();

    const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    const updatedProfileImage = profileImage ? profileImage : existingUser.profileImage;

    const [user] = await db
        .update(users)
        .set({ email, nickName, name, birthday, profileImage: updatedProfileImage, updatedAt: currentDate })
        .where(eq(users.id, id))
        .returning();

    return user;
};

/**
 * Updates the password of a user in the database.
 * @param id - The ID of the user.
 * @param password - The new password for the user.
 * @returns The updated user object.
 */
export const updateUserPassword = async (id: string, password: string, birthday: Date) => {
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(birthday);

    // Convert birthday to date format
    birthday = new Date(birthday);

    const [user] = await db.update(users).set({ passwordHash, birthday }).where(eq(users.id, id)).returning();

    return user;
};

/**
 * Updates the email and password of a user.
 * @param userId - The ID of the user.
 * @param email - The new email for the user.
 * @param password - The new password for the user.
 * @returns The updated user object.
 */
export const updateAdminCredentials = async (userId: string, email: string, password: string) => {
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
       o.payment_method AS payment_method,
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
        .set({ orderStatus: 'cancelled' })
        .where(and(eq(order.userId, userId), eq(order.orderStatus, 'success')))
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
        o.order_status AS order_status,
        o.payment_method AS payment_method,
        o.google_purchase_id AS google_purchase_id
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
                              COALESCE(
                                        CASE
                                            WHEN m.created_at < (SELECT created_at
                                                                 FROM users
                                                                 WHERE id = ${userId}) OR
                                                 m.approved = FALSE THEN 'hasnt sent a message yet'
                                              WHEN m.message = ''  THEN 'sent you a photo/sent you a voice note'
                                            ELSE m.message
                                            END,
                                        'hasnt sent a message yet'
                                )                                                                        AS last_message,
            m.created_at    AS last_message_time,
            (
                SELECT COUNT(*)
                FROM message
                WHERE conversation_id = c.id 
                AND message.approved = TRUE
                AND (
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
                AND created_at > (
                    SELECT created_at
                    FROM users
                    WHERE id = ${userId}
                )
            ) AS unread_count
            FROM order_idol
                INNER JOIN "order" o ON order_idol.order_id = o.id
                INNER JOIN idol i ON order_idol.idol_id = i.id
                INNER JOIN conversation c ON i.id = c.idol_id
                INNER JOIN users u ON i.user_id = u.id
                LEFT JOIN message m ON c.id = m.conversation_id AND m.approved = TRUE
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
 * @param _limit - The maximum number of messages to retrieve.
 * @param _offset - The number of messages to skip before retrieving.
 * @returns A promise that resolves to an array of messages.
 */
export const getUserConversationMessages = async (
    userId: string,
    conversationId: string,
    oderBy: string,
    sortDirection: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _limit: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _offset: number,
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messages: any[] = [];

    // const userIdTest = userId;y

    await db.transaction(async trx => {
        // Fetch the conversation messages
        messages = await trx.execute(
            sql.raw(
                `
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
        WHERE c.id = '${conversationId}'
        AND m.approved = TRUE
        AND m.created_at > (SELECT created_at FROM users WHERE id = '${userId}')
        ORDER BY ${oderBy} ${sortDirection}`,
            ),
        );

        console.log('messages', messages);

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let reactions = [] as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let attachments = [] as any[];
    if (messageIds.length > 0) {
        reactions = await getMessageReactions(messageIds);
        attachments = await getMessageAttachments(messageIds);
    }

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
    const idols = await db.execute(sql`
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
 * Sets the user's reaction to a message.
 * If the user has not reacted to the message before, a new reaction is created.
 * If the user has already reacted to the message with a different reaction, the reaction is updated.
 * If the user has already reacted to the message with the same reaction, the reaction is removed.
 * @param userId The ID of the user.
 * @param messageId The ID of the message.
 * @param reactionId The ID of the reaction.
 * @returns The newly created reaction, the updated reaction, or null if the reaction was removed.
 */
export const setUserReactionToMessage = async (userId: string, messageId: string, reactionId: string) => {
    const [existingReaction] = await db.execute(sql`
    SELECT * FROM message_reaction
    WHERE users_id = ${userId} AND message_id = ${messageId};
    `);

    if (!existingReaction) {
        const [newReaction] = await db.execute(sql`
        INSERT INTO message_reaction (users_id, message_id, reaction_id)
        VALUES (${userId}, ${messageId}, ${reactionId})
        RETURNING *;
        `);

        return newReaction;
    } else if (existingReaction.reaction_id === reactionId) {
        await db.execute(sql`
        DELETE FROM message_reaction
        WHERE users_id = ${userId} AND message_id = ${messageId};
        `);

        return null;
    } else {
        const [updatedReaction] = await db.execute(sql`
        UPDATE message_reaction
        SET reaction_id = ${reactionId}
        WHERE users_id = ${userId} AND message_id = ${messageId}
        RETURNING *;
        `);

        return updatedReaction;
    }
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

/**
 * Soft deletes a user by setting the `isDeleted` flag to true.
 * @param userId - The ID of the user to be soft deleted.
 * @returns The updated user object after soft deletion.
 */
export const softDeleteUser = async (userId: string) => {
    const [user] = await db.update(users).set({ isDeleted: true }).where(eq(users.id, userId)).returning();
    return user;
};

/**
 * Retrieves the birthday messages for a given user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of birthday messages.
 */
export const getUserBirthdayMessages = async (userId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let birthdayMessage = [] as any[];

    await db.transaction(async trx => {
        birthdayMessage = await trx.execute(sql`
            SELECT ms.personalized_message AS message,
                u2.name                 AS idol_name,
                u2.nickname             AS idol_nickname,
                u2.profile_image        AS profile_image,
                ms.created_at           AS created_at
            FROM message_scheduled ms
                INNER JOIN idol i ON ms.idol_id = i.id
                INNER JOIN users u ON ms.users_id = u.id
                INNER JOIN users u2 ON i.user_id = u2.id
            WHERE u.id = ${userId};
        `);

        await trx.execute(
            sql.raw(
                `INSERT INTO users_birthday (user_id, last_read_at)
                VALUES ('${userId}', NOW())
                ON CONFLICT (user_id) 
                DO UPDATE SET last_read_at = NOW()`,
            ),
        );
    });

    return birthdayMessage;
};

/**
 * Fetches the user IDs of users whose birthday is today.
 * @returns {Promise<number[]>} A promise that resolves to an array of user IDs.
 */
export const fetchTodayBirthdayUsers = async () => {
    const userIds = await db.execute(sql`
    SELECT id
        FROM users
        WHERE EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM birthday) = EXTRACT(DAY FROM CURRENT_DATE);`);

    return userIds;
};

/**
 * Checks if there is a user with a birthday today.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if there is a user with a birthday today.
 */
export const checkBirthday = async () => {
    const result = await db.execute(sql`
        SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM users
            WHERE (roles = 'user' OR roles = 'admin')
            AND EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM birthday) = EXTRACT(DAY FROM CURRENT_DATE)
        ) THEN TRUE
        ELSE FALSE
    END AS is_birthday_today;
        `);

    return result;
};

/**
 * Checks the subscription status for a given user.
 * @param userId - The ID of the user.
 * @returns A Promise that resolves to void.
 */
export const checkSubscriptionStatus = async (userId: string) => {
    const [status] = await db.execute(sql`
   SELECT EXISTS(
    SELECT 1
    FROM "order"
    WHERE user_id = ${userId}
      AND order_status = 'success'
) AS is_subscribed;
    `);

    return status;
};

/**
 * Retrieves the list of idol IDs associated with a specific user ID.
 * @param userId The ID of the user.
 * @returns A Promise that resolves to the list of idol IDs.
 */
export const getOrderedIdolsByUserId = async (userId: string) => {
    const idols = await db.execute(sql`
    SELECT idol_id
    FROM (SELECT DISTINCT ON (i.id) i.id      AS idol_id,
                                    o.user_id AS user_id
        FROM order_idol
                INNER JOIN "order" o ON order_idol.order_id = o.id
                INNER JOIN idol i ON order_idol.idol_id = i.id
        WHERE o.user_id = ${userId}
            AND o.order_status = 'success') AS subquery
    WHERE user_id = ${userId};
    `);

    return idols;
};

/**
 * Retrieves the FCM token for a given user ID.
 * @param userId The ID of the user.
 * @returns The FCM token associated with the user.
 */
export const getUserFcmToken = async (userId: string) => {
    const token = await db.execute(sql`
    SELECT token FROM fcm_token ft
        INNER JOIN users u ON ft.user_id = u.id
    WHERE u.id = ${userId};

    `);

    return token;
};

/**
 * Retrieves the phone number of a user.
 * @param userId - The ID of the user.
 * @returns The phone number of the user.
 */
export const getUserPhoneNumber = async (userId: string) => {
    const [phoneNumber] = await db
        .select({
            phoneNumber: users.phoneNumber,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return phoneNumber;
};
