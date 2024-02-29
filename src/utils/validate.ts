import { validate as isUuid } from 'uuid';

/**
 * Validates a UUID string.
 * @param uuid - The UUID string to validate.
 * @returns True if the UUID is valid, false otherwise.
 */
export const validateUuid = (uuid: string): boolean => {
    return isUuid(uuid);
};

/**
 * Validates a slug.
 *
 * @param slug - The slug to be validated.
 * @returns True if the slug is valid, false otherwise.
 */
export const validateSlug = (slug: string): boolean => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

/**
 * Validates a JKT48 member ID.
 * @param memberId - The member ID to validate.
 * @returns True if the member ID is valid, false otherwise.
 */
export const validateMemberId = (memberId: string): boolean => {
    const regex = /^JKT48-\d+$/;
    return regex.test(memberId);
};
