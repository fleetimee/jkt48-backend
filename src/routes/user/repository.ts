import { eq } from 'drizzle-orm';

import db from '../../db';
import { users } from '../../models/users';

export const getUserById = async (id: string) => {
    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    return user;
};
