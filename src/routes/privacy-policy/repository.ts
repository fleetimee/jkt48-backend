import db from '../../db';
import { privacyPolicy } from '../../models/privacy-policy';

/**
 * Retrieves the privacy policy data from the database.
 * @returns {Promise<object>} The privacy policy data.
 */
export const getPrivacyPolicy = async () => {
    const [privacyPolicyData] = await db.select().from(privacyPolicy).limit(1);

    return privacyPolicyData;
};
