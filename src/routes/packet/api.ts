import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getPackage, getPackageList, updatePackage } from './repository';
import { updatePackageSchema } from './schema';

const router = express.Router();

router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const packageList = await getPackageList();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches package list',
                data: packageList,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateUser, async (req, res, next) => {
    try {
        const packageId = req.params.id;

        if (!validateUuid(packageId)) throw new NotFoundError('Invalid package id (uuid) format');

        const packageItem = await getPackage(packageId);

        if (!packageItem) throw new NotFoundError('Package not found');

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetches package item',
                data: [packageItem],
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.patch(
    '/:id',
    validateSchema(updatePackageSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const { name, description, totalMembers, price, isActive } = req.body;
            const packageId = req.params.id;
            // const userId = req.user.id;
            const updatedAt = new Date();

            if (!validateUuid(packageId)) throw new NotFoundError('Invalid package id (uuid) format');

            const updatedPackage = await updatePackage(
                packageId,
                name,
                description,
                totalMembers,
                price,
                isActive,
                updatedAt,
            );

            if (!updatedPackage) throw new NotFoundError('Package not found');

            return res.status(StatusCodes.OK).send(
                formatResponse({
                    success: true,
                    code: StatusCodes.OK,
                    message: 'Success update package item',
                    data: [updatedPackage],
                }),
            );
        } catch (error) {
            next(error);
        }
    },
);

export default router;
