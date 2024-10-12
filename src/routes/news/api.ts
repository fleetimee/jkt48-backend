import express from 'express';
import { messaging } from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { StatusCodes } from 'http-status-codes';
import { nanoid } from 'nanoid';
import slugify from 'slugify';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { NotFoundError, UnauthorizedError } from '../../utils/errors';
import { formatResponse, formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { fetchAllUserFcmToken } from '../token/repository';
import { createNews, deleteNews, getLatestNews, getNews, getNewsBySlug, getNewsList, updateNews } from './repository';
import { createNewsSchema, updateNewsSchema } from './schema';

const router = express.Router();

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const orderBy = (req.query.orderBy as string) || 'created_at';
        const orderDirection = (req.query.orderDirection as string) || 'ASC';

        const offset = (page - 1) * pageSize;

        const newsList = await getNewsList(id, orderBy, orderDirection, pageSize, offset);

        return res.status(StatusCodes.OK).send(
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
        next(error);
    }
});

router.get('/latest', async (req, res, next) => {
    try {
        const news = await getLatestNews();
        if (!news) throw new NotFoundError('News not found');

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches latest news',
                data: news ? [news] : [],
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        const isValidUuid = validateUuid(id);
        if (!isValidUuid) throw new NotFoundError('Not valid UUID format');

        const newsItem = await getNews(id);
        if (!newsItem) throw new NotFoundError('News not found');

        return res.status(StatusCodes.OK).send(
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

router.get('/slug/:slug', async (req, res, next) => {
    try {
        const slug = req.params.slug;

        const newsItem = await getNewsBySlug(slug);
        if (!newsItem) throw new NotFoundError('News not found');

        return res.status(StatusCodes.OK).send(
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

router.post('/', validateSchema(createNewsSchema), authenticateUser, async (req, res, next) => {
    try {
        const { title, body, image } = req.body;
        const userId = req.user.id;

        const now = new Date();
        const nowDateAdd7Hours = new Date(now.setHours(now.getHours() + 7));

        const sluggify = slugify(title, {
            lower: true,
        });

        const slugWithRandomString = `${sluggify}-${nanoid(7)}`;

        const [newsItem, userFcmTokens] = await Promise.all([
            createNews(title, body, userId, image, slugWithRandomString, nowDateAdd7Hours, nowDateAdd7Hours),
            fetchAllUserFcmToken(),
        ]);

        if (userFcmTokens.length > 0) {
            const fcmTokens = userFcmTokens.map(token => token.token);

            const notificationMessage: Notification = {
                title: 'Update News JKT48 PM',
                body: title,
            };

            await messaging().sendEachForMulticast({
                tokens: fcmTokens as unknown as string[],
                notification: notificationMessage,
                android: {
                    notification: {
                        imageUrl: 'https://jkt48pm.my.id/static/logo_jkt48pm_2.png',
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            'mutable-content': 1,
                            sound: 'notification_sound.caf',
                        },
                    },
                    fcmOptions: {
                        imageUrl: 'https://jkt48pm.my.id/static/logo_jkt48pm_2.png',
                    },
                },
            });
        }

        // const newsItem = await createNews(title, body, userId, image, slugWithRandomString, now, now);

        return res.status(StatusCodes.CREATED).send(
            formatResponse({
                success: true,
                code: StatusCodes.CREATED,
                message: 'Success create news item',
                data: newsItem,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.put('/:newsId', validateSchema(updateNewsSchema), authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const isValidUuid = validateUuid(req.params.newsId);
        if (!isValidUuid) throw new NotFoundError('Not valid UUID format');

        const { title, body, image } = req.body;

        const newsId = req.params.newsId;
        const userId = req.user.id;

        const news = await getNews(newsId);
        if (!news) throw new NotFoundError('News not found');

        if (news.userId !== userId) throw new UnauthorizedError('News does not belong to user');

        const updatedNews = await updateNews(title, body, image, newsId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success update news item',
                data: updatedNews,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const id = req.params.id;

        const isValidUuid = validateUuid(id);
        if (!isValidUuid) throw new NotFoundError('Not valid UUID format');

        const news = await getNews(id);

        if (!news) throw new NotFoundError('News not found');

        await deleteNews(id);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success delete news item',
                data: null,
            }),
        );
    } catch (error) {
        console.log;
        next(error);
    }
});

export default router;
