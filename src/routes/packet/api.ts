import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { NotFoundError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate-uuid';
import { getPackage, getPackageList } from './repository';

const router = express.Router();

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const packageList = await getPackageList();

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches package list',
                data: packageList,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const packageId = req.params.id;

        if (!validateUuid(packageId)) throw new NotFoundError('Invalid package id (uuid) format');

        const packageItem = await getPackage(packageId);

        console.log(packageItem);

        if (!packageItem) throw new NotFoundError('Package not found');

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches package item',
                data: [packageItem],
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
