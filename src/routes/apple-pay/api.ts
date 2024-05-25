import {
    AppStoreServerAPIClient,
    Environment,
    HistoryResponse,
    Order,
    ProductType,
    ReceiptUtility,
    SignedDataVerifier,
    TransactionHistoryRequest,
} from '@apple/app-store-server-library';
import console from 'console';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import appleReceiptVerify from 'node-apple-receipt-verify';
import path from 'path';

import { APPLE_BUNDLE_ID, APPLE_ISSUER_ID, APPLE_KEY_ID } from '../../config';
import { validateSchema } from '../../middlewares/validate-request';
import { BadRequestError } from '../../utils/errors';
import { loadRootCAs } from '../../utils/lib';
import { readP8File } from '../../utils/read-file';
import { formatResponse } from '../../utils/response-formatter';
import { updateOrderSuccessStatusByAppleTransactionId } from '../order/repository';
import { appleVerifySchema } from './schema';

const router = express.Router();

router.post('/verify', async (req, res, next) => {
    try {
        const { body } = req;

        console.log('Apple Pay verify body', body);
    } catch (error) {
        next(error);
    }
});

router.post('/verifyApple', validateSchema(appleVerifySchema), async (req, res, next) => {
    try {
        const { receiptData } = req.body;

        const product = await appleReceiptVerify.validate({
            receipt: receiptData,
        });

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                data: product,
                message: 'Apple Pay verified successfully',
                success: true,
            }),
        );
    } catch (e) {
        if (e instanceof appleReceiptVerify.EmptyError) {
            // Return 400
            console.log('EmptyError');
        } else if (e instanceof appleReceiptVerify.ServiceUnavailableError) {
            // todo

            // Return 503
            throw new Error('ServiceUnavailableError');
        }

        next(e);
    }
});

router.post('/verifyAppleV2', validateSchema(appleVerifySchema), async (req, res, next) => {
    try {
        const { receiptData } = req.body;

        const issuerId = APPLE_ISSUER_ID;
        const keyId = APPLE_KEY_ID;
        const bundleId = APPLE_BUNDLE_ID;
        const p8Path = path.join(__dirname, '../../config/SubscriptionKey_4X4DAUH7SH.p8');
        const encodedKey = readP8File(p8Path);

        const client = new AppStoreServerAPIClient(
            encodedKey,
            issuerId as string,
            keyId as string,
            bundleId as string,
            Environment.SANDBOX,
        );

        console.log('Client', client);

        const receiptUtils = new ReceiptUtility();

        if (receiptData == null) {
            throw new BadRequestError('Please enter your receipt');
        }

        const transactionId = receiptUtils.extractTransactionIdFromAppReceipt(receiptData);
        console.log('Transaction ID', transactionId);

        const date = Date.now();

        console.log('Date', date);

        if (transactionId != null) {
            const transactionHistoryRequest: TransactionHistoryRequest = {
                sort: Order.ASCENDING,
                revoked: false,
                productTypes: [ProductType.AUTO_RENEWABLE],
            };

            console.log('Transaction History Request', transactionHistoryRequest);

            let response: HistoryResponse | null = null;

            console.log('Response', response);

            let transactions: string[] = [];

            console.log('Transactions', transactions);

            do {
                const revisionToken = response && response.revision ? response.revision : null;

                console.log('Revision Token', revisionToken);
                console.log('Response', response);
                console.log('TransactionId', transactionId);

                response = await client.getTransactionHistory(transactionId, null, transactionHistoryRequest);

                console.log('Response', response);

                if (response.signedTransactions) {
                    transactions = transactions.concat(response.signedTransactions);
                }
            } while (response.hasMore);
            console.log(transactions);

            res.status(StatusCodes.OK).send(
                formatResponse({
                    code: StatusCodes.OK,
                    data: transactions,
                    message: 'Apple Pay verified successfully',
                    success: true,
                }),
            );
        }
    } catch (error) {
        console.log('Error', error);
        next(error);
    }
});

router.post('/verifyAppleV3', async (req, res, next) => {
    try {
        const { signedPayload } = req.body;

        const bundleId = 'com.toeitechno.jkt48pm.ios';
        const appleRootCAs: Buffer[] = loadRootCAs();
        const enableOnlineChecks = true;
        const environment = Environment.SANDBOX;
        const appAppleId = undefined; // appAppleId is required when the environment is Production

        const verifier = new SignedDataVerifier(
            appleRootCAs,
            enableOnlineChecks,
            environment,
            bundleId as string,
            appAppleId,
        );

        const verifedNotification = await verifier.verifyAndDecodeNotification(signedPayload);

        const verifiedTransaction = await verifier.verifyAndDecodeTransaction(
            verifedNotification.data?.signedTransactionInfo as string,
        );

        console.log('Verified Notification', {
            notificationType: verifedNotification.notificationType,
            subtype: verifedNotification.subtype,
        });

        console.log('Verified Transaction', verifiedTransaction);

        const expiredData = verifiedTransaction.expiresDate;

        const utcDate = expiredData ? new Date(expiredData * 1000) : new Date();

        switch (verifedNotification.notificationType) {
            case 'SUBSCRIBE':
                switch (verifedNotification.subtype) {
                    case 'INITIAL_BUY':
                        updateOrderSuccessStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                            utcDate,
                        );

                        console.log('INITIAL_BUY');
                        break;
                    case 'RESUBSCRIBE':
                        updateOrderSuccessStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                            utcDate,
                        );

                        console.log('RESUBSCRIBE');
                        break;
                    default:
                        console.log(`Unhandled subtype: ${verifedNotification.subtype}`);
                }
                break;
            case 'CONSUMPTION_REQUEST':
                // Handle CONSUMPTION_REQUEST notification type
                break;
            case 'DID_CHANGE_RENEWAL_PREF':
                // Handle DID_CHANGE_RENEWAL_PREF notification type
                break;
            // Add more cases here as needed
            default:
                console.log(`Unhandled notification type: ${verifedNotification.notificationType}`);
        }

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                data: verifedNotification,
                message: 'Apple Pay verified successfully',
                success: true,
            }),
        );
    } catch (error) {
        console.log('Error', error);
        next(error);
    }
});

export default router;
