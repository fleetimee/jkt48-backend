import express from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

const router = express.Router();

export interface OneTimeProductNotification {
    version: string;
    notificationType: number;
    purchaseToken: string;
    sku: string;
}

export interface SubscriptionNotification {
    version: string;
    notificationType: number;
    purchaseToken: string;
    subscriptionId: string;
}

export interface VoidedPurchaseNotification {
    purchaseToken: string;
    orderId: string;
    productType: number;
    refundType: number;
}

export interface TestNotification {
    version: string;
}

export interface DeveloperNotification {
    version: string;
    packageName: string;
    eventTimeMillis: number;
    oneTimeProductNotification?: OneTimeProductNotification;
    subscriptionNotification?: SubscriptionNotification;
    voidedPurchaseNotification?: VoidedPurchaseNotification;
    testNotification?: TestNotification;
}
router.post('/verifyGoogle', async (req, res, next) => {
    try {
        const { body } = req;

        const decodedData: DeveloperNotification = JSON.parse(
            Buffer.from(body.message.data, 'base64').toString('utf-8'),
        );

        console.log('Decoded data:', decodedData);

        // Log the body
        // Log the decoded data
        const logData = `Decoded Data: ${JSON.stringify(decodedData, null, 2)}\n`;

        const logDir = 'logs/decodedData';
        const logFile = path.join(logDir, 'decodedData.txt');

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

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Google Pay verified',
            data: null,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
