import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { users } from '../../models/users';

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
