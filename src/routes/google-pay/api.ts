import express from 'express';
import { google } from 'googleapis';
import { StatusCodes } from 'http-status-codes';

import { DeveloperNotification } from '../../types/google-purchase';
import { GoogleNotificationType } from '../../utils/enum';
import { updateOrderPurchasedGoogle } from '../order/repository';

const router = express.Router();

router.post('/verifyGoogle', async (req, res, next) => {
    try {
        const { body } = req;

        const decodedData: DeveloperNotification = JSON.parse(
            Buffer.from(body.message.data, 'base64').toString('utf-8'),
        );

        console.log('Decoded data:', decodedData);

        const { packageName } = decodedData;

        const auth = new google.auth.GoogleAuth({
            keyFile: './src/config/service-account-androidPublisher.json',
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });

        console.log('Auth:', auth);

        const androidPublisher = google.androidpublisher({
            version: 'v3',
            auth: auth,
        });

        console.log('Android Publisher:', androidPublisher);

        let response;

        switch (true) {
            case !!decodedData.subscriptionNotification: {
                const { subscriptionNotification } = decodedData;

                console.log('Subscription notification:', subscriptionNotification);

                if (!subscriptionNotification) {
                    throw new Error('Subscription notification is undefined');
                }

                response = await androidPublisher.purchases.subscriptions.get({
                    packageName: packageName,
                    subscriptionId: subscriptionNotification.subscriptionId,
                    token: subscriptionNotification.purchaseToken,
                });

                switch (subscriptionNotification.notificationType) {
                    case GoogleNotificationType.SUBSCRIPTION_CANCELED: {
                        // Handle subscription cancellation
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_PURCHASED: {
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
                    case GoogleNotificationType.SUBSCRIPTION_RENEWED: {
                        // Handle subscription renewal
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_RECOVERED: {
                        // Handle subscription recovery
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_ON_HOLD: {
                        // Handle subscription on hold
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_IN_GRACE_PERIOD: {
                        // Handle subscription in grace period
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_RESTARTED: {
                        // Handle subscription restart
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_PRICE_CHANGE_CONFIRMED: {
                        // Handle subscription price change confirmed
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_DEFERRED: {
                        // Handle subscription deferral
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_PAUSED: {
                        // Handle subscription pause
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED: {
                        // Handle subscription pause schedule change
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_REVOKED: {
                        // Handle subscription revocation
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_EXPIRED: {
                        // Handle subscription expiration
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_PENDING_PURCHASE_CANCELED: {
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
