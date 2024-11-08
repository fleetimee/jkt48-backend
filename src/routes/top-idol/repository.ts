import { sql } from 'drizzle-orm';

import db from '../../db';

/**
 * Retrieves the top idol data.
 * @returns {Promise<Array<Object>>} The top idol data.
 */
export const getTopIdol = async () => {
    const topIdol = await db.execute(sql`
    SELECT
       u.id AS user_id,
       i.id AS idol_id,
       u.nickname,
       u.profile_image,
       it.subscription_count
    FROM idol_top it
    INNER JOIN idol i ON it.id_idol = i.id
    INNER JOIN users u ON i.user_id = u.id
    WHERE u.roles = 'member'
    ORDER BY it.subscription_count DESC
    LIMIT 5;
    `);

    return topIdol;
};

/**
 * Retrieves idols id.
 * @returns {Promise<Array<Object>>} The top idol data.
 */
export const getIdolIds = async () => {
    const idolsId = await db.execute(sql`
    SELECT id
    FROM "idol"
    `);
    return idolsId;
};

/**
 * Retrieves the top idol data by 7 last day.
 * @returns {Promise<Array<Object>>} The top idol data.
 */
export const getTopIdolByOrderTransaction = async () => {
    const topIdolCount = await db.execute(sql`
    SELECT idol_id, COUNT(idol_id) AS idol_count
    FROM order_idol
    WHERE order_id IN (
        SELECT id
        FROM "order"
        WHERE created_at BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE AND order_status = 'success'
    )
    GROUP BY idol_id;
    `);
    return topIdolCount;
};

/**
 * Truncate table idol_top.
 * @returns {Boolean}
 */
export const trunctateTopIdols = async () => {
    const truncateTopIdol = await db.execute(sql`
        TRUNCATE TABLE idol_top;
    `);

    if (truncateTopIdol) return true;
};

/**
 * Post the top idol data.
 * @returns {Promise<Array<Object>>} The top idol data.
 */
interface Datas {
    id_idol: any;
    subscription_count: any;
}
export const storeTopIdols = async (datas: Datas[]) => {
    await db.transaction(async trx => {
        for (const idol of datas) {
            await trx.execute(sql`
                INSERT INTO idol_top (id_idol, subscription_count)
                VALUES (${idol.id_idol}, ${idol.subscription_count}) RETURNING id_idol, subscription_count;
            `);
        }
    });
};
