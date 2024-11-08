import bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { users } from '../../models/users';
import { getConversationIdByIdolId } from '../conversation/repository';
import { getMessageAttachments, getMessageReactions } from '../messages/repository';

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
            i.bio,
            i.family_name,
            i.given_name,
            i.horoscope,
            i.blood_type,
            i.height,
            i.instagram_url,
            i.x_url,
            (
                SELECT COUNT(DISTINCT o.user_id)
                FROM order_idol oi
                INNER JOIN "order" o ON oi.order_id = o.id
                WHERE o.order_status = 'success'
                AND o.expired_at > NOW()
                AND oi.idol_id = i.id
            ) AS subscriber_count
        FROM users u
        INNER JOIN idol i ON u.id = i.user_id
        WHERE u.roles = 'member'
        AND i.id = ${memberId}
        `,
    );

    return member;
};

/**
 * Retrieves the member ID by user ID.
 * @param {string} userId - The user ID.
 * @returns {Promise<string>} The member ID.
 * @throws {Error} If no user is found with the given ID.
 */
export const getMemberIdByUserId = async (userId: string) => {
    const [member] = await db.execute(
        sql`
        SELECT i.id AS idol_id
        FROM idol i
        WHERE i.user_id = ${userId}
        `,
    );

    if (!member) {
        throw new Error(`No user found with id ${userId}`);
    }

    return member;
};

/**
 * Retrieves the member messages for a given idol.
 * @param idolId - The ID of the idol.
 * @returns A Promise that resolves to an array of member messages.
 */
export const getMemberMessage = async (idolId: string) => {
    const messages = await db.execute(
        sql`
     SELECT m.id         AS message_id,
       m.message    AS message,
       i.id         AS idol_id,
       m.approved   AS approved,
       m.created_at AS created_at
    FROM message m
            INNER JOIN users u ON m.user_id = u.id
            INNER JOIN idol i ON u.id = i.user_id
            INNER JOIN conversation c ON m.conversation_id = c.id
    WHERE i.id = ${idolId}
    ORDER BY m.created_at DESC
        `,
    );

    if (messages.length === 0) {
        return []; // Return an empty array if there are no messages
    }

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

export const getMemberMessageByMessageId = async (messageId: string) => {
    const [message] = await db.execute(
        sql`
     SELECT m.id         AS message_id,
       m.message    AS message,
       i.id         AS idol_id,
       m.approved   AS approved,
       m.created_at AS created_at
    FROM message m
            INNER JOIN users u ON m.user_id = u.id
            INNER JOIN idol i ON u.id = i.user_id
            INNER JOIN conversation c ON m.conversation_id = c.id
    WHERE m.id = ${messageId}
    ORDER BY m.created_at DESC
        `,
    );

    return message;
};

// export const getMemberMessageByMessageId = async (messageId: string) => {
//     const [message] = await db.execute(
//         sql`
//      SELECT m.id         AS message_id,
//        m.message    AS message,
//        i.id         AS idol_id,
//        m.approved   AS approved,
//        m.created_at AS created_at
//     FROM message m
//             INNER JOIN users u ON m.user_id = u.id
//             INNER JOIN idol i ON u.id = i.user_id
//             INNER JOIN conversation c ON m.conversation_id = c.id
//     WHERE m.id = ${messageId}
//     ORDER BY m.created_at DESC
//         `,
//     );

//     const messageIds = message.message_id;
//     const reactions = await getMessageReactions(messageId as string);
//     const attachments = await getMessageAttachments([messageIds]);

//     message.reactions = reactions
//         .filter(reaction => reaction.message_id === message.message_id)
//         .map(reaction => ({ ...reaction, reaction_count: parseInt(reaction.reaction_count as string, 10) }));

//     message.attachments = attachments.filter(attachment => {
//         attachment.file_size = Number(attachment.file_size);
//         return attachment.message_id === message.message_id;
//     });

//     return message;
// };

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
    imgProfilePath,
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
    imgProfilePath: string;
}) => {
    const passwordHash = await bcrypt.hash(password, 10);

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
                `INSERT INTO users (email, password_hash, name, nickname, birthday, profile_image, roles, email_verified, email_verified_at, verification_token, created_at)
                VALUES ('${email}', '${passwordHash}', '${fullName}', '${nickname}', '${birthday}', '${imgProfilePath}', 'member', true, NOW(), '${verificationToken}', NOW())
                RETURNING id`,
            ),
        );

        const [idolId] = await trx.execute(
            sql.raw(
                `INSERT INTO idol (user_id, instagram_url, x_url, height, blood_type, horoscope, family_name, given_name)
                VALUES ('${userId.id}', '${instagramUrl}', '${xUrl}', ${height}, '${bloodType}', '${horoscope}', '${familyName}', '${givenName}')
                RETURNING id
                `,
            ),
        );

        await trx.execute(
            sql.raw(
                `INSERT INTO conversation (idol_id)
                VALUES ('${idolId.id}')`,
            ),
        );
    });
};

export const createMemberMessage = async (
    userId: string,
    message: string,
    attachments?: Array<{ filePath: string; fileType: string; fileSize: number; checksum: string }>,
) => {
    let postedMessage;

    const idolId = await getMemberIdByUserId(userId);

    const conversationId = await getConversationIdByIdolId(idolId.idol_id as string);

    await db.transaction(async trx => {
        const [messageId] = await trx.execute(
            sql.raw(
                `INSERT INTO message (user_id, conversation_id, message, created_at)
                VALUES ('${userId}', '${conversationId.id}', '${message}', NOW())
                RETURNING id`,
            ),
        );

        if (attachments) {
            for (const attachment of attachments) {
                await trx.execute(
                    sql.raw(
                        `INSERT INTO message_attachment (message_id, file_path, file_type, file_size, checksum)
                        VALUES ('${messageId.id}', '${attachment.filePath}', '${attachment.fileType}', ${attachment.fileSize}, '${attachment.checksum}')`,
                    ),
                );
            }
        }

        // Fetch the posted message
        [postedMessage] = await trx.execute(
            sql.raw(`
        
            SELECT m.id         AS message_id,
            m.message    AS message,
            i.id         AS idol_id,
            m.approved   AS approved,
            m.created_at AS created_at
            FROM message m
                    INNER JOIN users u ON m.user_id = u.id
                    INNER JOIN idol i ON u.id = i.user_id
                    INNER JOIN conversation c ON m.conversation_id = c.id
            WHERE m.id = '${messageId.id}'
            ORDER BY m.created_at DESC
        `),
        );

        // Fetch the attachments
        const attachmentsResult = await trx.execute(
            sql.raw(`
                SELECT file_path, file_type, file_size, checksum
                FROM message_attachment
                WHERE message_id = '${messageId.id}'
            `),
        );

        // Add empty arrays for reactions and attachments
        postedMessage.reactions = [];
        postedMessage.attachments = attachmentsResult;
    });

    return postedMessage;
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
    idolId: string,
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
            WHERE id = (SELECT user_id FROM idol WHERE id = '${idolId}')
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
            WHERE id = '${idolId}'
            `,
            ),
        );
    });
};

export const updateLoggedMember = async (userId: string, fullName: string, bio: string) => {
    await db.transaction(async trx => {
        await trx.execute(
            sql.raw(
                `
            UPDATE users
            SET name = '${fullName}'
            WHERE id = '${userId}'
            `,
            ),
        );

        await trx.execute(
            sql.raw(
                `
            UPDATE idol
            SET bio = '${bio}'
            WHERE user_id = '${userId}'
            `,
            ),
        );
    });
};

export const updateLoggedMemberProfileImage = async (userId: string, imgProfilePath: string) => {
    await db.transaction(async trx => {
        await trx.execute(
            sql.raw(
                `
            UPDATE users
            SET profile_image = '${imgProfilePath}'
            WHERE id = '${userId}'
            `,
            ),
        );
    });
};

/**
 * Updates the profile image of a member by their idol ID.
 * @param idolId - The ID of the idol.
 * @param imgProfilePath - The path of the new profile image.
 */
export const updateProfileImageMemberById = async (idolId: string, imgProfilePath: string) => {
    await db.transaction(async trx => {
        await trx.execute(
            sql.raw(
                `
                UPDATE users
                SET profile_image = '${imgProfilePath}'
                WHERE id = (
                    SELECT user_id
                    FROM idol
                    WHERE id = '${idolId}'
                )
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
