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

/**
 * Creates an invoice using the provided Xendit data.
 * @param xenditData - The data required to create the invoice.
 * @returns The created invoice.
 */
export const createInvoice = async (xenditData: CreateInvoiceRequest) => {
    console.log(xenditData);

    const response: Invoice = await xenditInvoiceClient.createInvoice({
        data: xenditData,
    });

    console.log(response);

    return response;
};

/**
 * Retrieves an invoice by its ID.
 * @param {string} invoiceId - The ID of the invoice to retrieve.
 * @returns {Promise<Invoice>} - A promise that resolves to the retrieved invoice.
 */
export const getInvoice = async (invoiceId: string) => {
    const response: Invoice = await xenditInvoiceClient.getInvoiceById({
        invoiceId,
    });

    return response;
};
