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
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

import { APPLE_BUNDLE_ID, APPLE_ISSUER_ID, APPLE_KEY_ID } from '../../config';
import { validateSchema } from '../../middlewares/validate-request';
import { AppleNotificationSubType, AppleNotificationType } from '../../utils/enum';
import { BadRequestError } from '../../utils/errors';
import { loadRootCAs } from '../../utils/lib';
import { readP8File } from '../../utils/read-file';
import { formatResponse } from '../../utils/response-formatter';
import {
    createOrderAppleResubscribe,
    updateOrderCancelledStatusByAppleTransactionId,
    updateOrderExpiredStatusByAppleTransactionId,
    updateOrderSuccessStatusByAppleTransactionId,
} from '../order/repository';
import { appleVerifySchema } from './schema';

const router = express.Router();

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

            return res.status(StatusCodes.OK).send(
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

        console.log('Verified Notification', {
            notificationType: verifedNotification.notificationType,
            subtype: verifedNotification.subtype,
        });

        // Log the verified notification
        const logData = `Verified Notification: ${JSON.stringify(
            {
                notificationType: verifedNotification.notificationType,
                subtype: verifedNotification.subtype,
            },
            null,
            2,
        )}\n`;

        const logDir = 'logs/notification';
        const logFile = path.join(logDir, 'notification.txt');

        fs.mkdir(logDir, { recursive: true }, err => {
            if (err) {
                console.error('Error creating log directory', err);
                return;
            }

            fs.appendFile(logFile, logData, err => {
                if (err) {
                    console.error('Error writing to log file', err);
                }
            });
        });

        if (!verifedNotification.data?.signedTransactionInfo) {
            return res.status(200).send(
                formatResponse({
                    code: StatusCodes.OK,
                    data: verifedNotification,
                    message: 'Apple Pay verified successfully without transaction info',
                    success: true,
                }),
            );
            return;
        }

        const verifiedTransaction = await verifier.verifyAndDecodeTransaction(
            verifedNotification.data?.signedTransactionInfo as string,
        );

        // Log the verified transaction
        const logDataTransaction = `Verified Transaction: ${JSON.stringify(verifiedTransaction, null, 2)}\n`;

        const logDirTransaction = 'logs/transaction';
        const logFileTransaction = path.join(logDirTransaction, 'transaction.txt');

        fs.mkdir(logDirTransaction, { recursive: true }, err => {
            if (err) {
                console.error('Error creating log directory', err);
                return;
            }

            fs.appendFile(logFileTransaction, logDataTransaction, err => {
                if (err) {
                    console.error('Error writing to log file', err);
                }
            });
        });

        console.log('Verified Transaction', verifiedTransaction);

        const expiredData = verifiedTransaction.expiresDate;

        const utcDate = expiredData ? new Date(expiredData) : new Date();

        console.log('UTC Date', utcDate);

        switch (verifedNotification.notificationType) {
            case AppleNotificationType.SUBSCRIBED:
                switch (verifedNotification.subtype) {
                    case AppleNotificationSubType.INITIAL_BUY:
                        await updateOrderSuccessStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                            utcDate,
                        );

                        break;
                    case AppleNotificationSubType.RESUBSCRIBE:
                        await updateOrderExpiredStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                        );
                        await createOrderAppleResubscribe(verifiedTransaction.originalTransactionId as string);
                        break;
                }
                break;
            case AppleNotificationType.DID_FAIL_TO_RENEW:
                switch (verifedNotification.subtype) {
                    case AppleNotificationSubType.GRACE_PERIOD:
                        await updateOrderExpiredStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                        );
                        break;
                }
                break;
            case AppleNotificationType.DID_RENEW:
                switch (verifedNotification.subtype) {
                    case AppleNotificationSubType.BILLING_RECOVERY:
                        await updateOrderSuccessStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                            utcDate,
                        );
                        break;
                }
                await updateOrderExpiredStatusByAppleTransactionId(verifiedTransaction.originalTransactionId as string);

                await createOrderAppleResubscribe(verifiedTransaction.originalTransactionId as string);
                break;
            case AppleNotificationType.EXPIRED:
                switch (verifedNotification.subtype) {
                    case AppleNotificationSubType.VOLUNTARY:
                        await updateOrderExpiredStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                        );
                        break;
                    case AppleNotificationSubType.BILLING_RETRY:
                        await updateOrderExpiredStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                        );
                        break;
                }
                break;
            case AppleNotificationType.DID_CHANGE_RENEWAL_STATUS:
                switch (verifedNotification.subtype) {
                    case AppleNotificationSubType.AUTO_RENEW_DISABLED:
                        await updateOrderCancelledStatusByAppleTransactionId(
                            verifiedTransaction.originalTransactionId as string,
                        );
                        break;
                }
                break;
        }

        return res.status(StatusCodes.OK).send(
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
