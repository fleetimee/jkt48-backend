import express from 'express';
// import { google } from 'googleapis';
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

        // console.log('Decoded data:', decodedData);

        // const { packageName } = decodedData;

        // const auth = new google.auth.GoogleAuth({
        //     keyFile: './src/config/service-account-androidPublisher.json',
        //     scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        //     // credentials: {
        //     //     client_email: 'jkt48pm-play-billing@jkt48pm.iam.gserviceaccount.com',
        //     //     private_key:
        //     //         '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDF0ZmhrxSWLHyV\nzvnL65ZIREe4Qb37mDlo7/DawtOkjyRO8SgHSKqpgVAMlEbaTyCoEyk7MEvSCmWW\nPmvhK5d9eq9yMZJoCXhrzye+c0rBR1GS3FQpkz71veq7V6454DrQImlqL0WJlYeG\nPk6MjRSCLjh281rxwN4aubiFFKAGQO7MGTsZlSPEm8WNX13cPy0HDEbGUePoJzeb\nW27F36vbdgzEUAatMM+Op254qMKNJY7YRzIYZ7Tl+DPHuMfBGdowbs2+DEy0FiET\nINgJ2diB33NXheXByc1O1WhxG/KCelrmxQCkRTy2THCTZe/3bCc1hcSc6qfGeOZW\nuhubU0LTAgMBAAECggEABtvfSCQ07NwQBHW6YuABREeHIRQOd/RtkSjjS1fT/3Gt\nyvBA+LeuoH/zpuwBOj03dFHDF+KdzmOT5Xi2mYZpve0Mu5iNFf8LZi7hluXnzU8h\nZ0aCbd/wH+nSLhAP4haB6N44lM5HdUoc+oJF4POx/ALe7FOVxKobnrDv0pVw0vv1\nDl5AKwZPRpNkoQt6mZrbqb4iU1NOB322paEVmFXbZ5puqvI68pjcsUEMLLmu/9LR\nP2g5uro1VWn9abKhY45HxIVQdOx8UvbaFvzSZJNGOnRpYf3MLg+wvuI+PfRbXr2t\nnPpL1U9hw/j/BJ6QruV6tcVi/jdLMKWbPh7iavl3aQKBgQDz7bkRpvcWeL736uIZ\nM+tIxkb7NzY+Gp6Ixl+xYoPMFEArFrfUjJH1iCIP9/ihaLDtm5E/3jM6Jr62nxvh\noNObQYf9fKE8ZJWkEfj05AZVmeAC84nd15KCO8OFz/k3eQOn7PDInW3GFri0S2o+\nV98zp9TwHLkf9cFvZ8pDcUzjdQKBgQDPm7jDuQNpY78AIchNSQqOwHluF/5Q9Kff\nw0A/w1TX6k2ygZf7gcrBmlJvsKjM0OIDo4P8LyvfeDZt1actwa17Cms6gRPMvUAA\n3y4dpf7B1p0bBjtATFHKPW5dVLj7WsLHjmZI0d4QcFMR6H6uytTChLRi/BYvAjwT\nyUG5iWKsJwKBgQDBPCgo+Liy35KA+VyFlKCmNRST/CgHSLUgKu4xqpY3/C7dM5EL\nWxRhiqdZORqIW1QV1vBYxSCVx427RA4lTm9zhZVCVRGxswjsQaST83OlKlHQZLdp\nu1V/v/JjNd76d+5SgBw7AKOukd9eTIPswVW7KRBB6q8ox1mmdHVBuiar5QKBgQCx\nODTYnq6S4FrDOhNKJfelNBh0KncllDNZh8roo01hotkAcC/Uuk7iRWHphdwSOp00\njfi05W+GK5AK4j77iEEWryYpotXMCCECnYE4PeLihNlHoGIj2QJYqWf0s8XUiv2K\na7xUnRH65meC+fxqKSrFgZKajKZDKp0uJra8MtLQMQKBgQCZ3mR4Hz3pIesnKIh7\n96H9Fs0wWhqHQlj+znhFvVdv3OBxnZwXNDWZu/bVku1cJjq8CO0Y/efv7n03tbbr\ntHg7AnVbv19QBWK46i+5mWLyiw9ucCoQcI2GnEdRfvCYgCWxd9WkHPb0nde9teSI\nR9CPPkpSG+qVQoaVdPPCh5KnZw==\n-----END PRIVATE KEY-----\n',
        //     // },
        // });

        // const androidPublisher = google.androidpublisher({
        //     version: 'v3',
        //     auth: 'AIzaSyDZNZiDV6Z6Q5KcdrgWvldGN9aAOV0TB4M',
        // });

        // let response;

        switch (true) {
            case !!decodedData.subscriptionNotification: {
                const { subscriptionNotification } = decodedData;

                if (!subscriptionNotification) {
                    throw new Error('Subscription notification is undefined');
                }

                // response = await androidPublisher.purchases.subscriptions.get({
                //     packageName: packageName,
                //     subscriptionId: subscriptionNotification.subscriptionId,
                //     token: subscriptionNotification.purchaseToken,
                // });

                switch (subscriptionNotification.notificationType) {
                    case GoogleNotificationType.SUBSCRIPTION_CANCELED: {
                        // Handle subscription cancellation
                        break;
                    }
                    case GoogleNotificationType.SUBSCRIPTION_PURCHASED: {
                        // Handle subscription purchase

                        const expiryDate = new Date();
                        expiryDate.setMonth(expiryDate.getMonth() + 1);

                        await updateOrderPurchasedGoogle(subscriptionNotification.purchaseToken, expiryDate);

                        return res.status(StatusCodes.OK).send({
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

        // console.log('Google Play response:', response?.data);

        return res.status(StatusCodes.OK).send({
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
