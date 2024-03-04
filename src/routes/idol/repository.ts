import { sql } from 'drizzle-orm';

import db from '../../db';

/**
 * Retrieves a list of members with optional filtering and pagination.
 * @param limit The maximum number of members to retrieve.
 * @param offset The number of members to skip before starting to retrieve.
 * @param orderBy The column to order the members by.
 * @param sortDirection The direction to sort the members in (ASC or DESC).
 * @param query Optional search query to filter members by nickname.
 * @returns A Promise that resolves to an array of member objects.
 */
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

/**
 * Retrieves a member by their ID.
 * @param memberId - The ID of the member to retrieve.
 * @returns A Promise that resolves to the member object.
 */
export const getMemberById = async (memberId: string) => {
    const [member] = await db.execute(
        sql`
        SELECT u.id AS user_id,
            i.id AS idol_id,
            u.nickname,
            u.birthday,
            u.profile_image,
            i.family_name,
            i.given_name,
            i.horoscope
        FROM users u
        INNER JOIN idol i ON u.id = i.user_id
        WHERE u.roles = 'member' AND i.id = ${memberId}

        `,
    );

    return member;
};
