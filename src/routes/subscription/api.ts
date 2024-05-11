import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { rateLimiter } from '../../middlewares/rate-limiter';
import { validateSchema } from '../../middlewares/validate-request';
import { formatResponse } from '../../utils/response-formatter';
import { getUserById } from '../user/repository';
import { createCustomer } from './repository';
import { createCustomerSchema } from './schema';

const router = express.Router();

router.post(
    '/createCustomer',
    authenticateUser,
    validateSchema(createCustomerSchema),
    rateLimiter,
    async (req, res, next) => {
        try {
            const { reference_id, given_names, email } = req.body;

            // Build the request body
            const xenditData = {
                reference_id: reference_id,
                type: 'INDIVIDUAL',
                individual_detail: {
                    given_names,
                },
                email: email,
            };

            // Check first if user has customer id
            const user = await getUserById(reference_id);

            if (user.xenditCustomerId) {
                return res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(
                    formatResponse({
                        success: false,
                        code: StatusCodes.UNPROCESSABLE_ENTITY,
                        message: 'Customer already exists',
                        data: user.xenditCustomerId,
                    }),
                );
            }

            // Call the createCustomer function
            const customer = await createCustomer(xenditData);

            res.status(StatusCodes.OK).send(
                formatResponse({
                    success: true,
                    code: StatusCodes.OK,
                    message: 'Customer created',
                    data: customer,
                }),
            );
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
);

// router.post('/createPlan', async (req, res, next) => {
//     try {

//     } catch (error) {
//         console.log(error);
//         next(error);
//     }
// });

export default router;
