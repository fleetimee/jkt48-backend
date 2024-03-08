import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../../utils/response-formatter';
import { getTopIdol, getTopIdolByOrderTransaction, storeTopIdols, trunctateTopIdols } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const topIdol = await getTopIdol();

        if (!topIdol || topIdol.length === 0) {
            res.status(404).send(
                formatResponse({
                    code: StatusCodes.NOT_FOUND,
                    message: 'No top idol found',
                    success: false,
                    data: [],
                }),
            );
        } else {
            res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Success fetch top idol',
                    data: topIdol,
                    success: true,
                }),
            );
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/by-week', async (req, res, next) => {
    try {
        const idols_count: { id_idol: any; subscription_count: any }[] = [];

        // Truncate table top idols
        await trunctateTopIdols();

        // Data to store
        const topIdol = await getTopIdolByOrderTransaction();
        topIdol.forEach(el => {
            idols_count.push({ id_idol: el.idol_id, subscription_count: el.idol_count });
        });

        if (topIdol) {
            await storeTopIdols(idols_count);
            res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Success Repopulate top idol',
                    data: idols_count,
                    success: true,
                }),
            );
        } else {
            res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Success Repopulate top idol',
                    data: 0,
                    success: true,
                }),
            );
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
