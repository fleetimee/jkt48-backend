import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validate } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { validateUuid } from '../../utils/validate';
import { countRegisteredUsers, getUserById, updateUser } from './repository';
import { updateUserSchema } from './schema';

const router = express.Router();

router.get('/me', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        res.status(StatusCodes.OK).send({ user });
    } catch (error) {
        next(error);
    }
});

router.get('/count', async (req, res, next) => {
    try {
        const count = await countRegisteredUsers();

        res.status(StatusCodes.OK).send({ count });
    } catch (error) {
        next(error);
    }
});

router.patch('/me', validate(updateUserSchema), authenticateUser, async (req, res, next) => {
    try {
        const isValidUuid = validateUuid(req.user.id);
        if (!isValidUuid) throw new NotFoundError('UserId not valid (uuid)');

        const id = req.user.id;
        const { name, email, nickName, birthday, profileImage } = req.body;

        const user = await updateUser(id, email, nickName, name, birthday, profileImage);

        res.status(StatusCodes.OK).send({ user });
    } catch (error) {
        next(error);
    }
});

export default router;
