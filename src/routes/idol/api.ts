import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { NotFoundError, UnprocessableEntityError } from '../../utils/errors';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateMemberId } from '../../utils/validate';
import { getMemberById, getMembers } from './repository';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const orderBy = (req.query.orderBy as string) || 'created_at';
        const orderDirection = (req.query.orderDirection as string) || 'ASC';
        const searchQuery = req.query.searchQuery as string;

        const offset = (page - 1) * pageSize;

        const newsList = await getMembers(pageSize, offset, orderBy, orderDirection, searchQuery);

        res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetch idol list',
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

        if (!validateMemberId(id)) throw new UnprocessableEntityError('The member ID is not valid JKT48 member ID');

        const member = await getMemberById(id);
        if (!member) throw new NotFoundError('Member not found');

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success fetch member',
            data: member,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
