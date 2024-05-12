import { messaging } from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';

import { getBirthdayMessages, insertBirthdayMessage } from '../routes/messages/repository';
import {
    checkSubscriptionStatus,
    getOrderedIdolsByUserId,
    getUserById,
    getUserFcmToken,
} from '../routes/user/repository';

export const processUserBirthday = async (user: Record<string, unknown>) => {
    try {
        const subscriptionStatus = await checkSubscriptionStatus(user.id as string);

        if (!subscriptionStatus) {
            console.log('User subscription status is not active');
            return;
        }

        const idolIds = await getOrderedIdolsByUserId(user.id as string);

        for (const idol of idolIds) {
            const [birthdayMessage, userDetails, userFcmTokens] = await Promise.all([
                getBirthdayMessages(idol.idol_id as string),
                getUserById(user.id as string),
                getUserFcmToken(user.id as string),
            ]);

            birthdayMessage.message = birthdayMessage.message.replace('{{nickname}}', userDetails.name as string);

            if (userFcmTokens.length > 0) {
                const fcmTokens = userFcmTokens.map(item => item.token);

                const notificationMessage: Notification = {
                    title: 'Happy Birthday!',
                    body: 'You have a birthday message! 🎉',
                };

                await messaging().sendEachForMulticast({
                    tokens: fcmTokens as unknown as string[],
                    notification: notificationMessage,
                });
            }

            await insertBirthdayMessage(
                user.id as string,
                idol.idol_id as string,
                (birthdayMessage.message as string) || 'Happy Birthday! 🎉',
            );
        }
    } catch (error) {
        console.log('Error processing user birthday:', error);
    }
};
