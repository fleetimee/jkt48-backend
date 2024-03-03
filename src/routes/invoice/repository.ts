import Xendit, { Invoice as InvoiceClient } from 'xendit-node';
import { CreateInvoiceRequest, Invoice } from 'xendit-node/invoice/models';

import { XENDIT_SECRET_KEY } from '../../config';

const xenditClient = new Xendit({ secretKey: XENDIT_SECRET_KEY as string });
const { Invoice } = xenditClient;

const xenditInvoiceClient = new InvoiceClient({ secretKey: XENDIT_SECRET_KEY as string });

// const data: CreateInvoiceRequest = {
//     externalId: '12xnm2kajkd2121287348989475',
//     amount: 10000,
//     currency: 'IDR',
//     description: 'Invoice for order #111',
//     payerEmail: 'zane.227@gmail.com',
// };

export const createInvoice = async (xenditData: CreateInvoiceRequest, forUserId: string) => {
    // console.log(data);

    const response: Invoice = await xenditInvoiceClient.createInvoice({
        data: xenditData,
        forUserId: forUserId,
    });

    console.log(response);

    return response;
};

export const getInvoice = async (invoiceId: string) => {
    const response: Invoice = await xenditInvoiceClient.getInvoiceById({
        invoiceId,
    });
    console.log(response);

    console.log(response);

    return response;
};
