import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { validate } from '../../middlewares/validate-request';
import { formatResponse } from '../../utils/response-formatter';
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
        const idUser = req.user.id;

        const { idOrder, amount, currency, description, payerEmail } = req.body;

        // const getOrder = await getOrderBy

        const invoice = await createInvoice(
            {
                externalId: idOrder,
                amount,
                currency,
                description,
                payerEmail,
            },
            idUser,
        );

        res.status(StatusCodes.OK).send(
            formatResponse({
                success: true,
                code: StatusCodes.OK,
                message: 'Invoice created',
                data: invoice,
            }),
        );
    } catch (error) {
        // console.error(error);
        next(error);
    }
});

export default router;
