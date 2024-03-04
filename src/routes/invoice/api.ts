import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validate } from '../../middlewares/validate-request';
import { UnprocessableEntityError } from '../../utils/errors';
import { formatResponse } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getInquiryOrder } from '../order/repository';
import { createInvoice, getInvoice } from './repository';
import { createInvoiceSchema } from './schema';

const router = express.Router();

router.get('/:invoiceId', async (req, res, next) => {
    try {
        const invoiceId = req.params.invoiceId;

        const invoice = await getInvoice(invoiceId);

        console.log(invoice);

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice fetched',
                data: invoice,
            }),
        );
    } catch (error) {
        // console.error(error);
        next(error);
    }
});

router.post('/', validate(createInvoiceSchema), authenticateUser, async (req, res, next) => {
    try {
        const { id, email, name } = req.user;

        const { idOrder, currency } = req.body;

        // Check if idOrder is valid
        if (!validateUuid(idOrder)) throw new UnprocessableEntityError('The orderId is not a valid UUID');

        // Check if order exists

        // Inquiry order to get package details
        const inquiryOrder = await getInquiryOrder(idOrder);

        console.log(inquiryOrder);

        const invoice = await createInvoice({
            externalId: idOrder,
            payerEmail: email,
            amount: inquiryOrder.order_total as number,
            currency,
            description: 'Pembayaran JKT48 Private Message',
            customer: {
                id: id,
                email: email,
                customerId: `${id}-${Date.now()}`,
                givenNames: name,
            },
            items: [
                {
                    name: inquiryOrder.package_name as string,
                    price: inquiryOrder.order_subtotal as number,
                    quantity: 1,
                    category: inquiryOrder.category as string,
                },
                {
                    name: 'Tax',
                    price: inquiryOrder.order_tax as number,
                    quantity: 1,
                    category: 'tax',
                },
            ],
        });

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice created',
                data: invoice,
            }),
        );
    } catch (error) {
        console.error(error);
        next(error);
    }
});

export default router;
