import express from 'express';
import { google } from 'googleapis';
import { StatusCodes } from 'http-status-codes';

import { updateOrderPurchasedGoogle } from '../order/repository';

const router = express.Router();

export enum NotificationType {
    SUBSCRIPTION_RECOVERED = 1,
    SUBSCRIPTION_RENEWED = 2,
    SUBSCRIPTION_CANCELED = 3,
    SUBSCRIPTION_PURCHASED = 4,
    SUBSCRIPTION_ON_HOLD = 5,
    SUBSCRIPTION_IN_GRACE_PERIOD = 6,
    SUBSCRIPTION_RESTARTED = 7,
    SUBSCRIPTION_PRICE_CHANGE_CONFIRMED = 8,
    SUBSCRIPTION_DEFERRED = 9,
    SUBSCRIPTION_PAUSED = 10,
    SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED = 11,
    SUBSCRIPTION_REVOKED = 12,
    SUBSCRIPTION_EXPIRED = 13,
    SUBSCRIPTION_PENDING_PURCHASE_CANCELED = 20,
}

export interface OneTimeProductNotification {
    version: string;
    notificationType: number;
    purchaseToken: string;
    sku: string;
}

export interface SubscriptionNotification {
    version: string;
    notificationType: NotificationType;
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

        const { packageName } = decodedData;

        const auth = new google.auth.GoogleAuth({
            keyFile: '../../config/service-account-androidPublisher.json',
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });

        const androidPublisher = google.androidpublisher({
            version: 'v3',
            auth: auth,
        });

        let response;

        switch (true) {
            case !!decodedData.subscriptionNotification: {
                const { subscriptionNotification } = decodedData;

                if (!subscriptionNotification) {
                    throw new Error('Subscription notification is undefined');
                }

                response = await androidPublisher.purchases.subscriptions.get({
                    packageName: packageName,
                    subscriptionId: subscriptionNotification.subscriptionId,
                    token: subscriptionNotification.purchaseToken,
                });

                switch (subscriptionNotification.notificationType) {
                    case NotificationType.SUBSCRIPTION_CANCELED: {
                        // Handle subscription cancellation
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_PURCHASED: {
                        // Handle subscription purchase

                        const expiryDate = new Date(Number(response.data.expiryTimeMillis));

                        await updateOrderPurchasedGoogle(subscriptionNotification.purchaseToken, expiryDate);

                        res.status(StatusCodes.OK).send({
                            success: true,
                            code: StatusCodes.OK,
                            message: 'Google Pay verified',
                            data: null,
                        });

                        return;
                    }
                    case NotificationType.SUBSCRIPTION_RENEWED: {
                        // Handle subscription renewal
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_RECOVERED: {
                        // Handle subscription recovery
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_ON_HOLD: {
                        // Handle subscription on hold
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_IN_GRACE_PERIOD: {
                        // Handle subscription in grace period
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_RESTARTED: {
                        // Handle subscription restart
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_PRICE_CHANGE_CONFIRMED: {
                        // Handle subscription price change confirmed
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_DEFERRED: {
                        // Handle subscription deferral
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_PAUSED: {
                        // Handle subscription pause
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED: {
                        // Handle subscription pause schedule change
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_REVOKED: {
                        // Handle subscription revocation
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_EXPIRED: {
                        // Handle subscription expiration
                        break;
                    }
                    case NotificationType.SUBSCRIPTION_PENDING_PURCHASE_CANCELED: {
                        // Handle subscription pending purchase cancellation
                        break;
                    }
                    default: {
                        throw new Error('No valid subscription notification found');
                    }
                }

                break;
            }
            case !!decodedData.oneTimeProductNotification: {
                // Handle oneTimeProductNotification
                break;
            }
            case !!decodedData.voidedPurchaseNotification: {
                // Handle voidedPurchaseNotification
                break;
            }
            case !!decodedData.testNotification: {
                // Handle testNotification
                break;
            }
            default: {
                throw new Error('No valid notification found');
            }
        }

        console.log('Google Play response:', response?.data);

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Google Pay verified',
            data: null,
        });
    } catch (error) {
        console.error('Error verifying Google Pay:', error);
        next(error);
    }
});

export default router;
