import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { NotFoundError, UnprocessableEntityError } from '../../utils/errors';
import { generateVerificationCode } from '../../utils/lib';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateMemberId, validateUuid } from '../../utils/validate';
import { getUser } from '../auth/repository';
import { getUserById } from '../user/repository';
import { createMember, getMemberById, getMembers, updateMemberById } from './repository';
import { createIdolSchema, updateIdolSchema } from './schema';

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

router.post('/', validateSchema(createIdolSchema), authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const { email, password, fullName, nickname, birthday, height, bloodType, horoscope } = req.body;

        // Check if the email is already registered
        const user = await getUser(email);
        if (user) throw new UnprocessableEntityError('Email is already registered');

        // Generate verification token
        const verificationToken = generateVerificationCode();

        const newMember = await createMember({
            email,
            fullName,
            nickname,
            birthday,
            height,
            bloodType,
            horoscope,
            password,
            verificationToken,
        });

        res.status(StatusCodes.CREATED).send({
            success: true,
            code: StatusCodes.CREATED,
            message: 'Success create new member',
            data: newMember,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.patch(
    '/:userId',
    validateSchema(updateIdolSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const userId = req.params.userId;

            console.log('userId', userId);

            if (!validateUuid(userId)) throw new UnprocessableEntityError('User id is not valid');

            const { email, fullName, nickname, birthday, height, bloodType, horoscope } = req.body;

            const user = await getUserById(userId);
            if (!user) throw new NotFoundError('User not found');

            // const birthdayDate = new Date(birthday);

            const updatedMember = await updateMemberById(
                userId,
                email,
                fullName,
                nickname,
                birthday,
                height,
                bloodType,
                horoscope,
            );

            res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'Success update member',
                data: updatedMember,
            });
        } catch (error) {
            console.error(error);

            next(error);
        }
    },
);

export default router;
