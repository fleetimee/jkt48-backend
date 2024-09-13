import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { UnprocessableEntityError } from '../../utils/errors';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getConversations, getConversationsById } from './repository';

const router = express.Router();

router.get('/', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const id = req.user.id;

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const searchQuery = req.query.searchQuery as string;

        const offset = (page - 1) * pageSize;

        const conversationList = await getConversations(id, pageSize, offset, searchQuery);

        return res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                success: true,
                code: StatusCodes.OK,
                data: conversationList ? [...conversationList] : [],
                meta: {
                    page,
                    pageSize,
                    orderBy: '',
                    orderDirection: '',
                },

                message: 'Success fetch conversation list',
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const conversationId = req.params.id;

        if (!validateUuid(conversationId)) throw new UnprocessableEntityError('The conversation ID is not valid');

        const conversation = await getConversationsById(conversationId);

        return res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success fetch conversation',
            data: conversation,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
