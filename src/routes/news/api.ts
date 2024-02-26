import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { NotFoundError } from '../../utils/errors';
import { formatResponse, formatResponsePaginated } from '../../utils/response-formatter';
import { getNews, getNewsList } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const orderBy = (req.query.orderBy as string) || 'created_at';
        const orderDirection = (req.query.orderDirection as string) || 'ASC';

        const offset = (page - 1) * pageSize;

        const newsList = await getNewsList(orderBy, orderDirection, pageSize, offset);

        console.log(newsList);

        res.status(200).send(
            formatResponsePaginated({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches news list',
                data: newsList,
                meta: {
                    page,
                    pageSize,
                    orderBy,
                    orderDirection,
                },
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        const newsItem = await getNews(id);
        if (!newsItem) throw new NotFoundError('News not found');

        // res.status(200).send({ newsItem });

        res.status(200).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches news item',
                data: [newsItem],
            }),
        );
    } catch (error) {
        next(error);
    }
});

export default router;
