import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { rateLimiter } from '../../middlewares/rate-limiter';
import { validateSchema } from '../../middlewares/validate-request';
import { XenditCreateCustomer } from '../../types/xendit-create-customer';
import {
    Currency,
    FailedCycleAction,
    ImmediateActionType,
    Interval,
    ItemType,
    Locale,
    NotificationChannel,
    RecurringAction,
    XenditCreatePlan,
} from '../../types/xendit-create-plan';
import { UnprocessableEntityError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getInquiryOrder, getOrderById } from '../order/repository';
import { getUserById } from '../user/repository';
import { createCustomer, createSubscription } from './repository';
import { createCustomerSchema } from './schema';

const router = express.Router();

router.post(
    '/createCustomer',
    authenticateUser,
    validateSchema(createCustomerSchema),
    rateLimiter,
    async (req, res, next) => {
        try {
            const { reference_id, given_names, email, phoneNumber: mobile_number } = req.body;

            const xenditData: XenditCreateCustomer = {
                reference_id: reference_id,
                type: 'INDIVIDUAL',
                individual_detail: {
                    given_names,
                },
                email: email,
                mobile_number: mobile_number,
            };

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

            const customer = await createCustomer(xenditData);

            return res.status(StatusCodes.OK).send(
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

router.post('/createPlan', async (req, res, next) => {
    try {
        const { reference_id, customer_id } = req.body;

        if (!validateUuid(reference_id)) throw new UnprocessableEntityError('The reference_id is not a valid UUID');

        const order = await getOrderById(reference_id);
        if (!order) throw new UnprocessableEntityError('The order does not exist');

        if (order.orderStatus === 'success') throw new UnprocessableEntityError('The order has already been paid');

        const inquiryOrder = await getInquiryOrder(reference_id);

        const date = new Date();

        const referenceIdWithTimestamp = `${reference_id}-${date.getTime()}`;

        const xenditPlanData: XenditCreatePlan = {
            reference_id: reference_id,
            customer_id: customer_id,
            recurring_action: RecurringAction.PAYMENT,
            currency: Currency.IDR,
            amount: Number(inquiryOrder.order_total),
            schedule: {
                reference_id: referenceIdWithTimestamp,
                interval: Interval.MONTH,
                interval_count: 1,
                anchor_date: date.toISOString(),
            },
            immediate_action_type: ImmediateActionType.FULL_AMOUNT,
            failed_cycle_action: FailedCycleAction.STOP,
            description: `Pembayaran Langganan JKT48 Private Message - 1 bulan - ${inquiryOrder.package_name} - Recurring Payment`,
            items: [
                {
                    type: ItemType.DIGITAL_PRODUCT,
                    name: inquiryOrder.package_name as string,
                    net_unit_amount: Number(inquiryOrder.order_subtotal),
                    quantity: Number(inquiryOrder.quantity),
                    category: inquiryOrder.category as string,
                    description: inquiryOrder.package_description as string,
                },
                {
                    type: ItemType.FEES,
                    name: 'Pajak 11%',
                    net_unit_amount: Number(inquiryOrder.order_tax),
                    quantity: 1,
                    category: 'tax',
                    description: 'Pajak atas pembelian produk digital',
                },
            ],
            payment_methods: [],
            notification_config: {
                recurring_created: [NotificationChannel.EMAIL],
                recurring_succeeded: [NotificationChannel.EMAIL],
                recurring_failed: [NotificationChannel.EMAIL],
                locale: Locale.ID,
            },
        };

        console.log(xenditPlanData);

        const payment = await createSubscription(xenditPlanData);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Plan Created',
                data: payment,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

export default router;
