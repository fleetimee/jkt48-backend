import db from '../../db';
import { terms } from '../../models/terms';

/**
 * Retrieves the terms of service from the database.
 * @returns {Promise<any>} A promise that resolves to the terms of service.
 */
export const getTermsOfService = async () => {
    const [tos] = await db.select().from(terms).limit(1);

    return tos;
};
