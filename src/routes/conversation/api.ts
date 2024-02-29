import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponsePaginated } from '../../utils/response-formatter';
import { getConversations } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const searchQuery = req.query.searchQuery as string;

        const offset = (page - 1) * pageSize;

        const conversationList = await getConversations({
            limit: pageSize,
            offset,
            searchQuery,
        });

        res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                success: true,
                code: StatusCodes.OK,
                data: conversationList ? [...conversationList] : [],
                meta: {
                    page,
                    pageSize,
                    orderBy: 'id',
                    orderDirection: 'ASC',
                },

                message: 'Success fetch conversation list',
            }),
        );
    } catch (error) {
        next(error);
    }
});
