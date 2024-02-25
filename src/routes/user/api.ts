import express from 'express';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { NotFoundError } from '../../utils/errors';
import { getUserById } from './repository';

const router = express.Router();

router.get('/users/:id', authenticateUser, async (req, res, next) => {
    try {
        const id = req.params.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        res.status(200).send({ user });
    } catch (error) {
        next(error);
    }
});
