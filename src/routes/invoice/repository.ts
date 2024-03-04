import Xendit, { Invoice as InvoiceClient } from 'xendit-node';
import { CreateInvoiceRequest, Invoice } from 'xendit-node/invoice/models';

import { XENDIT_SECRET_KEY } from '../../config';

const xenditClient = new Xendit({ secretKey: XENDIT_SECRET_KEY as string });
const { Invoice } = xenditClient;

const xenditInvoiceClient = new InvoiceClient({ secretKey: XENDIT_SECRET_KEY as string });

/**
 * Retrieves a list of invoices.
 * @returns {Promise<Invoice[]>} A promise that resolves to an array of invoices.
 */
export const getInvoices = async () => {
    const response: Invoice[] = await xenditInvoiceClient.getInvoices({});

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

/**
 * Creates an invoice using the provided Xendit data.
 * @param xenditData - The data required to create the invoice.
 * @returns The created invoice.
 */
export const createInvoice = async (xenditData: CreateInvoiceRequest) => {
    const response: Invoice = await xenditInvoiceClient.createInvoice({
        data: xenditData,
    });

    return response;
};

/**
 * Expires an invoice.
 * @param invoiceId - The ID of the invoice to expire.
 * @returns The expired invoice.
 */
export const expireInvoice = async (invoiceId: string) => {
    const response: Invoice = await xenditInvoiceClient.expireInvoice({
        invoiceId,
    });

    return response;
};
