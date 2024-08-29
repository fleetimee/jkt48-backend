import { differenceInDays } from 'date-fns';
import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { UnprocessableEntityError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getCloseToExpirationOrders, getInquiryOrder, getOrderById } from '../order/repository';
import { getUserById, getUserPhoneNumber } from '../user/repository';
import { createInvoice, expireInvoice, getInvoice, getInvoices } from './repository';
import { createInvoiceSchema } from './schema';

const router = express.Router();

router.get('/scheduledInvoice', async (req, res, next) => {
    try {
        // Get orderId that almost expired
        const orderIds = await getCloseToExpirationOrders();

        if (!orderIds || orderIds.length === 0) {
            return res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'No order that almost expired',
                data: null,
            });
            return;
        }

        for (const orderId of orderIds) {
            console.log(orderId);

            // Get order details
            const order = await getOrderById(orderId.id as unknown as string);
            console.log(order);

            // Get user from order
            const user = await getUserById(order.userId);
            console.log(user);

            // Inquiry order to get package details
            const inquiryOrder = await getInquiryOrder(orderId.id as unknown as string);
            console.log(inquiryOrder);

            // Build request body for creating invoice
            await createInvoice({
                externalId: orderId.id as unknown as string,
                payerEmail: user.email,
                amount: inquiryOrder.order_total as number,
                currency: 'IDR',
                description: `Perpanjangan Langganan JKT48 Private Message - ${inquiryOrder.package_name}`,
                local: 'id',
                reminderTime: 1,
                reminderTimeUnit: 'days',
                customer: {
                    email: user.email,
                    givenNames: user.name,
                    mobileNumber: user.phoneNumber as string,
                },
                customerNotificationPreference: {
                    invoiceCreated: ['email', 'whatsapp', 'sms'],
                    invoicePaid: ['email', 'whatsapp', 'sms'],
                    invoiceReminder: ['email', 'whatsapp', 'sms'],
                },
                items: [
                    {
                        name: inquiryOrder.package_name as string,
                        price: inquiryOrder.order_subtotal as number,
                        quantity: 1,
                        category: inquiryOrder.category as string,
                    },
                ],
                fees: [
                    {
                        type: 'PPN 11%',
                        value: inquiryOrder.order_tax as number,
                    },
                ],
            });

            return res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'Scheduled invoice created',
                data: null,
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const invoices = await getInvoices();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoices fetched',
                data: invoices,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:invoiceId', authenticateUser, async (req, res, next) => {
    try {
        const invoiceId = req.params.invoiceId;

        const invoice = await getInvoice(invoiceId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice fetched',
                data: invoice,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/:invoiceId/forceExpire', authenticateUser, async (req, res, next) => {
    try {
        const invoiceId = req.params.invoiceId;

        const invoice = await expireInvoice(invoiceId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice expired',
                data: invoice,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.post('/', validateSchema(createInvoiceSchema), authenticateUser, async (req, res, next) => {
    try {
        // Get user details from the request
        const { id, email, name } = req.user;

        // Get order details from the body of the request
        const { idOrder, currency } = req.body;

        // Check if idOrder is valid
        if (!validateUuid(idOrder)) throw new UnprocessableEntityError('The orderId is not a valid UUID');

        // Check if the order exists
        const order = await getOrderById(idOrder);
        if (!order) throw new UnprocessableEntityError('The order does not exist');

        let phoneNumber = await getUserPhoneNumber(id);

        if (!phoneNumber) {
            phoneNumber = { phoneNumber: null };
        }
        if (!phoneNumber) throw new UnprocessableEntityError('The user does not have a phone number');

        // Check if the order is not already paid and is within 7 days of expiration
        if (order.orderStatus === 'success') {
            const currentDate = new Date();
            const expiredAt = order.expiredAt as Date;
            const daysUntilExpiration = differenceInDays(expiredAt, currentDate);

            if (daysUntilExpiration > 7) {
                throw new UnprocessableEntityError(
                    'The order has already been paid and is not within 7 days of expiration',
                );
            }
        }

        // Inquiry order to get package details
        const inquiryOrder = await getInquiryOrder(idOrder);

        // Build request body for creating invoice
        const invoice = await createInvoice({
            externalId: idOrder,
            payerEmail: email,
            amount: inquiryOrder.order_total as number,
            currency,
            description: `Pembayaran untuk JKT48 Private Message - ${inquiryOrder.package_name}`,
            local: 'id',
            customer: {
                id: id,
                email: email,
                customerId: `${id}-${Date.now()}`,
                givenNames: name,
                mobileNumber: phoneNumber.phoneNumber as string,
            },
            customerNotificationPreference: {
                invoiceCreated: ['email', 'whatsapp', 'sms'],
                invoicePaid: ['email', 'whatsapp', 'sms'],
                invoiceReminder: ['email', 'whatsapp', 'sms'],
            },
            reminderTimeUnit: 'days',
            reminderTime: 1,
            items: [
                {
                    name: inquiryOrder.package_name as string,
                    price: inquiryOrder.order_subtotal as number,
                    quantity: 1,
                    category: inquiryOrder.category as string,
                },
            ],
            fees: [
                {
                    type: 'PPN 11%',
                    value: inquiryOrder.order_tax as number,
                },
            ],
        });

        return res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice created',
                data: invoice,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

export default router;
