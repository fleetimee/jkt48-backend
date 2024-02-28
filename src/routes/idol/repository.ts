/* eslint-disable unused-imports/no-unused-vars */

import { sql } from 'drizzle-orm';

import db from '../../db';

export const getMembers = async (
    limit: number,
    offset: number,
    orderBy: string,
    sortDirection: string,
    query?: string,
) => {
    let whereClause = '';
    if (query) {
        whereClause = `AND LOWER(u.nickname) LIKE LOWER('%${query}%')`;
    }

    const members = await db.execute(
        sql.raw(
            `SELECT u.id AS user_id,
                i.id AS idol_id,
                u.nickname,
                u.birthday,
                u.profile_image,
                i.family_name,
                i.given_name,
                i.horoscope
         FROM users u
         INNER JOIN idol i ON u.id = i.user_id
         WHERE u.roles = 'member' ${whereClause}
         ORDER BY ${orderBy} ${sortDirection} LIMIT ${limit} OFFSET ${offset}`,
        ),
    );

    return members;
};
