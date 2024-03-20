import bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { users } from '../../models/users';

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
        SELECT u.id   AS user_id,
            i.id   AS idol_id,
            u.email,
            u.name AS full_name,
            u.nickname,
            u.birthday,
            u.profile_image,
            i.family_name,
            i.given_name,
            i.horoscope,
            i.blood_type,
            i.height,
            i.instagram_url,
            i.x_url
        FROM users u
                INNER JOIN idol i ON u.id = i.user_id
        WHERE u.roles = 'member'
        AND i.id = ${memberId}
        `,
    );

    return member;
};

/**
 * Creates a new member in the database.
 * @param {Object} memberData - The data of the member to be created.
 * @param {string} memberData.email - The email of the member.
 * @param {string} memberData.password - The password of the member.
 * @param {string} memberData.fullName - The full name of the member.
 * @param {string} memberData.nickname - The nickname of the member.
 * @param {Date} memberData.birthday - The birthday of the member.
 * @param {number} memberData.height - The height of the member.
 * @param {string} memberData.bloodType - The blood type of the member.
 * @param {string} memberData.horoscope - The horoscope of the member.
 * @param {string} memberData.verificationToken - The verification token of the member.
 * @param {string} memberData.xUrl - The X URL of the member.
 * @param {string} memberData.instagramUrl - The Instagram URL of the member.
 * @returns {Promise<void>} - A promise that resolves when the member is created.
 */
export const createMember = async ({
    email,
    password,
    fullName,
    nickname,
    birthday,
    height,
    bloodType,
    horoscope,
    verificationToken,
    xUrl,
    instagramUrl,
}: {
    email: string;
    password: string;
    fullName: string;
    nickname: string;
    birthday: Date;
    height: number;
    bloodType: string;
    horoscope: string;
    verificationToken: string;
    xUrl: string;
    instagramUrl: string;
}) => {
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Instagram URL: ${instagramUrl}`);
    console.log(`X URL: ${xUrl}`);

    let givenName = '';
    let familyName = '';

    if (fullName.includes(' ')) {
        givenName = fullName.split(' ').slice(0, -1).join(' ');
        familyName = fullName.split(' ').slice(-1).join(' ');
    } else {
        givenName = fullName;
    }

    await db.transaction(async trx => {
        const [userId] = await trx.execute(
            sql.raw(
                `INSERT INTO users (email, password_hash, name, nickname, birthday, roles, email_verified, email_verified_at, verification_token, created_at)
                VALUES ('${email}', '${passwordHash}', '${fullName}', '${nickname}', '${birthday}', 'member', true, NOW(), '${verificationToken}', NOW())
                RETURNING id`,
            ),
        );

        await trx.execute(
            sql.raw(
                `INSERT INTO idol (user_id, instagram_url, x_url, height, blood_type, horoscope, family_name, given_name)
                VALUES ('${userId.id}', '${instagramUrl}', '${xUrl}', ${height}, '${bloodType}', '${horoscope}', '${familyName}', '${givenName}')`,
            ),
        );
    });
};

/**
 * Updates a member's information by their ID.
 * @param userId - The ID of the user.
 * @param email - The updated email address.
 * @param fullName - The updated full name.
 * @param nickName - The updated nickname.
 * @param birthday - The updated birthday.
 * @param height - The updated height.
 * @param bloodType - The updated blood type.
 * @param horoscope - The updated horoscope.
 */
export const updateMemberById = async (
    userId: string,
    email: string,
    fullName: string,
    nickName: string,
    birthday: Date,
    height: number,
    bloodType: string,
    horoscope: string,
) => {
    await db.transaction(async trx => {
        await trx.execute(
            sql.raw(
                `
            UPDATE users
            SET email = '${email}',
                name = '${fullName}',
                nickname = '${nickName}',
                birthday = '${birthday}'
            WHERE id = '${userId}'
            `,
            ),
        );

        await trx.execute(
            sql.raw(
                `
            UPDATE idol
            SET height = ${height},
                blood_type = '${bloodType}',
                horoscope = '${horoscope}'
            WHERE user_id = '${userId}'
            `,
            ),
        );
    });
};

/**
 * Deletes a member by their ID.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<void>} - A promise that resolves when the member is deleted.
 */
export const deleteMemberById = async (userId: string) => {
    await db.delete(users).where(eq(users.id, userId));
};
