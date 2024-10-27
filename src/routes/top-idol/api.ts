import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { cacheMiddleware, cacheResponse } from '../../middlewares/caching';
import { verifyCustomHeader } from '../../middlewares/legit';
import { formatResponse } from '../../utils/response-formatter';
import { getIdolIds, getTopIdol, getTopIdolByOrderTransaction, storeTopIdols, trunctateTopIdols } from './repository';

const router = express.Router();

router.get('/', cacheMiddleware('top-idol'), async (req, res, next) => {
    try {
        const topIdol = await getTopIdol();

        console.log('Top idol:', topIdol);

        if (!topIdol || topIdol.length === 0) {
            const response = formatResponse({
                code: StatusCodes.NOT_FOUND,
                message: 'No top idol found',
                success: false,
                data: [],
            });

            res.status(404).send(response);

            await cacheResponse('top-idol', response);
            return;
        } else {
            const response = formatResponse({
                code: StatusCodes.OK,
                message: 'Success fetch top idol',
                data: topIdol,
                success: true,
            });

            res.status(200).send(response);

            await cacheResponse('top-idol', response);
            return;
        }
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
});

router.get('/by-week', verifyCustomHeader, async (req, res, next) => {
    try {
        await trunctateTopIdols();

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
