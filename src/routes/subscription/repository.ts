import { eq } from 'drizzle-orm';

import { XENDIT_SECRET_KEY } from '../../config';
import db from '../../db';
import { users } from '../../models/users';
import { XenditCreateCustomer } from '../../types/xendit-create-customer';
import { XenditCreatePlan } from '../../types/xendit-create-plan';

/**
 * Creates a customer using Xendit API.
 * @param xenditData - The data required to create a customer.
 * @returns The customer data returned by the Xendit API.
 */
export const createCustomer = async (xenditData: XenditCreateCustomer) => {
    const url = 'https://api.xendit.co/customers';

    const base64ApiKey = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(xenditData),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${base64ApiKey}`,
        },
    });

    const customerData = await response.json();

    if (response.ok) {
        if (xenditData.reference_id) {
            await db
                .update(users)
                .set({ xenditCustomerId: customerData.id })
                .where(eq(users.id, xenditData.reference_id));
        }
    }

    return customerData;
};

export const createSubscription = async (xenditData: XenditCreatePlan) => {
    const url = 'https://api.xendit.co/recurring/plans';

    const base64ApiKey = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(xenditData),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${base64ApiKey}`,
        },
    });

    return response.json();
};
