import express from 'express';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validate } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { getUserById, updateUser } from './repository';
import { updateUserSchema } from './schema';

const router = express.Router();

router.get('/me', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        res.status(200).send({ user });
    } catch (error) {
        next(error);
    }
});

router.patch('/me', validate(updateUserSchema), authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;
        const { name, email, nickName, birthday, profileImage } = req.body;

        const user = await updateUser(id, email, nickName, name, birthday, profileImage);

        res.status(200).send({ user });
    } catch (error) {
        next(error);
    }
});

export default router;
