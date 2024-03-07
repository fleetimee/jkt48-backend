import bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { order } from '../../models/order';
import { users } from '../../models/users';

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
        o.expired_at     AS expired_at
    FROM "order" o
            INNER JOIN package p ON o.package_id = p.id
    WHERE o.user_id = ${userId}
    AND o.id = ${orderId};
    `);

    return transaction;
};
