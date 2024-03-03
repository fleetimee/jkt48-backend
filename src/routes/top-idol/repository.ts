import { sql } from 'drizzle-orm';

import db from '../../db';

export const getTopIdol = async () => {
    const topIdol = await db.execute(sql`
    SELECT
       u.id AS user_id,
       i.id AS idol_id,
       u.nickname,
       u.profile_image,
       it.subscription_count
    FROM idol_top it
    INNER JOIN idol i ON it.id_idol = i.id
    INNER JOIN users u ON i.user_id = u.id
    WHERE u.roles = 'member'
    ORDER BY it.subscription_count DESC
    LIMIT 5;
    `);

    return topIdol;
};
