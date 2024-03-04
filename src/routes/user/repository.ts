import { eq, sql } from 'drizzle-orm';

import db from '../../db';
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

export const countRegisteredUsers = async () => {
    const [count] = await db
        .select({
            count: sql<number>`cast(count(*) as int) as count`,
        })
        .from(users);

    return count;
};
