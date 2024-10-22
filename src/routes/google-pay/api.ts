import 'winston-daily-rotate-file';

import express from 'express';
// import { google } from 'googleapis';
import { StatusCodes } from 'http-status-codes';
import winston from 'winston';

import { DeveloperNotification } from '../../types/google-purchase';
import { GoogleNotificationType } from '../../utils/enum';
import { updateOrderCanceledGoogle, updateOrderPurchasedGoogle, updateOrderRenewedGoogle } from '../order/repository';

const router = express.Router();

const fileTransportGoogle = new winston.transports.DailyRotateFile({
    filename: 'logs/google/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const loggerGoogle = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'jkt48-pm-google' },
    transports: [
        fileTransportGoogle,
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

router.post('/verifyGoogle', async (req, res, next) => {
    try {
        const { body } = req;

        const decodedData: DeveloperNotification = JSON.parse(
            Buffer.from(body.message.data, 'base64').toString('utf-8'),
        );

        loggerGoogle.info('Decoded data:', decodedData);

        switch (true) {
            case !!decodedData.subscriptionNotification: {
                const { subscriptionNotification } = decodedData;

                if (!subscriptionNotification) {
                    throw new Error('Subscription notification is undefined');
                }

                loggerGoogle.info('Entering subscriptionNotification case:', subscriptionNotification);

                switch (subscriptionNotification.notificationType) {
                    case GoogleNotificationType.SUBSCRIPTION_CANCELED: {
                        loggerGoogle.info('Handling SUBSCRIPTION_CANCELED');
                        const cancellationDate = new Date();
                        await updateOrderCanceledGoogle(subscriptionNotification.purchaseToken, cancellationDate);

                        return res.status(StatusCodes.OK).send({
                            success: true,
                            code: StatusCodes.OK,
                            message: 'Subscription cancellation verified',
                        });
                    }
                    case GoogleNotificationType.SUBSCRIPTION_PURCHASED: {
                        loggerGoogle.info('Handling SUBSCRIPTION_PURCHASED');
                        const expiryDate = new Date();
                        expiryDate.setMonth(expiryDate.getMonth() + 1);

                        await updateOrderPurchasedGoogle(subscriptionNotification.purchaseToken, expiryDate);

                        return res.status(StatusCodes.OK).send({
                            success: true,
                            code: StatusCodes.OK,
                            message: 'Google Pay verified',
                            data: null,
                        });
                    }
                    case GoogleNotificationType.SUBSCRIPTION_RENEWED: {
                        loggerGoogle.info('Handling SUBSCRIPTION_RENEWED');
                        const expiryDate = new Date();
                        expiryDate.setMonth(expiryDate.getMonth() + 1);
                        await updateOrderRenewedGoogle(subscriptionNotification.purchaseToken, expiryDate);

                        return res.status(StatusCodes.OK).send({
                            success: true,
                            code: StatusCodes.OK,
                            message: 'Subscription renewed verified',
                        });
                    }
                    // Add logging for other cases as needed
                    default: {
                        throw new Error('No valid subscription notification found');
                    }
                }

                break;
            }
            case !!decodedData.oneTimeProductNotification: {
                loggerGoogle.info('Handling oneTimeProductNotification');
                // Handle oneTimeProductNotification
                break;
            }
            case !!decodedData.voidedPurchaseNotification: {
                loggerGoogle.info('Handling voidedPurchaseNotification');
                // Handle voidedPurchaseNotification
                break;
            }
            case !!decodedData.testNotification: {
                loggerGoogle.info('Handling testNotification');
                // Handle testNotification
                break;
            }
            default: {
                throw new Error('No valid notification found');
            }
        }

        return res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Google Pay verified',
            data: null,
        });
    } catch (error) {
        loggerGoogle.error('Error verifying Google Pay:', error);
        next(error);
    }
});

export default router;
