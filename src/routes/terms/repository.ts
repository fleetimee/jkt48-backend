import db from '../../db';
import { terms } from '../../models/terms';

export const getTermsOfService = async () => {
    const [tos] = await db.select().from(terms).limit(1);

    return tos;
};
