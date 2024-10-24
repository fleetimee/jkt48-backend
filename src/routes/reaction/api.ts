import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { cacheResponse, redisClient } from '../../middlewares/caching';
import { formatResponse } from '../../utils/response-formatter';
import { getReactions } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const reactions = await getReactions();

        const cacheKey = 'reactions';

        // Cache the data
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            res.setHeader('Content-Type', 'application/json');
            return res.send(JSON.parse(cachedData));
        }

        const response = formatResponse({
            code: StatusCodes.OK,
            message: 'Reactions fetched successfully',
            data: reactions,
            success: true,
        });

        await cacheResponse(cacheKey, response);

        return res.status(StatusCodes.OK).send(response);
    } catch (error) {
        next(error);
    }
});

export default router;
