import db from '../../db';
import { privacyPolicy } from '../../models/privacy-policy';

export const getPrivacyPolicy = async () => {
    const [privacyPolicyData] = await db.select().from(privacyPolicy).limit(1);

    return privacyPolicyData;
};
