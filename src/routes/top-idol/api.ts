import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../../utils/response-formatter';
import { getIdolIds, getTopIdol, getTopIdolByOrderTransaction, storeTopIdols, trunctateTopIdols } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const topIdol = await getTopIdol();

        if (!topIdol || topIdol.length === 0) {
            return res.status(404).send(
                formatResponse({
                    code: StatusCodes.NOT_FOUND,
                    message: 'No top idol found',
                    success: false,
                    data: [],
                }),
            );
        } else {
            return res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Success fetch top idol',
                    data: topIdol,
                    success: true,
                }),
            );
        }
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
});

router.get('/by-week', async (req, res, next) => {
    try {
        // Truncate table top idols
        await trunctateTopIdols();

        // Build data
        const idolsCount: { id_idol: any; subscription_count: any }[] = [];
        const idolList = await getIdolIds();
        const topIdols = await getTopIdolByOrderTransaction();

        topIdols.forEach(el => {
            idolsCount.push({ id_idol: el.idol_id, subscription_count: el.idol_count });
        });

        if (topIdols) {
            const mergedArray = idolList.map(idolListItem => {
                const found = topIdols.find(arr1Item => arr1Item.idol_id === idolListItem.id);

                return {
                    id_idol: idolListItem.id,
                    subscription_count: found ? found.idol_count : '0',
                };
            });

            await storeTopIdols(mergedArray);
            return res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Success Repopulate top idol',
                    data: mergedArray,
                    success: true,
                }),
            );
        } else {
            return res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Success Repopulate top idol',
                    data: 0,
                    success: true,
                }),
            );
        }
    } catch (error) {
        next(error);
    }
});

export default router;
