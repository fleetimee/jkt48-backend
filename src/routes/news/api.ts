import express from 'express';
import { StatusCodes } from 'http-status-codes';
import slugify from 'slugify';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validate } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { formatResponse, formatResponsePaginated } from '../../utils/response-formatter';
import { createNews, getNews, getNewsList } from './repository';
import { createNewsSchema } from './schema';

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

router.post('/', validate(createNewsSchema), authenticateUser, async (req, res, next) => {
    try {
        const { title, body, image } = req.body;
        const userId = req.user.id;

        // Current date and time
        const now = new Date();

        // Generate slug from title
        const sluggify = slugify(title, {
            lower: true,
        });

        const newsItem = await createNews(title, body, userId, image, sluggify, now, now);

        res.status(200).send({ newsItem });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
