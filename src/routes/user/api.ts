import console from 'console';
import express from 'express';
import { messaging } from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

import { authenticateUser, requireAdminRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { NotFoundError } from '../../utils/errors';
import { uploadUserProfile } from '../../utils/multer';
import { formatResponse, formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { getAllAttachmentsByConversationId } from '../attachment/repository';
import { changeAdminCredentialsSchema, changePasswordSchema } from '../auth/schema';
import { getConversationsById } from '../conversation/repository';
import { getMessagesById } from '../messages/repository';
import { getOrderById } from '../order/repository';
import { getReactionById } from '../reaction/repository';
import { fetchFcmTokenByUserId } from '../token/repository';
import {
    cancelSubscription,
    checkUserSubscription,
    checkUserSubscriptionOderIdol,
    countActiveSubscriptionsUsers,
    countRegisteredUsers,
    deleteUserReactToMessage,
    getUserActiveIdols,
    getUserBirthdayMessages,
    getUserById,
    getUserByIdWithUnreadNewsCount,
    getUserConversationList,
    getUserConversationMessages,
    getUserIdWithUnreadBirthdayMessageCount,
    getUserTransactionDetail,
    getUserTransactionList,
    setUserReactionToMessage,
    updateAdminCredentials,
    updateUser,
    updateUserPassword,
} from './repository';
import { postReaction, updateUserSchema } from './schema';

const router = express.Router();

router.get('/me', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        return res.status(StatusCodes.OK).send({ user });
    } catch (error) {
        next(error);
    }
});

router.get('/me/birthdayInbox', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const birthdayInbox = await getUserBirthdayMessages(id);

        console.log(birthdayInbox);

        if (birthdayInbox.length < 1) throw new NotFoundError('Birthday inbox not found');

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Birthday inbox',
                data: birthdayInbox,
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/me/birthdayCheck', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const userWithBirthday = await getUserIdWithUnreadBirthdayMessageCount(id);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Birthday checked',
                data: userWithBirthday,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/newsCheck', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const userWithNews = await getUserByIdWithUnreadNewsCount(id);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'News checked',
                data: userWithNews,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/checkSubscription', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const subscription = await checkUserSubscription(id);
        if (!subscription) throw new NotFoundError('Subscription not found');

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Subscription status checked',
                data: subscription,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/cancelSubscription', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const checkSubscription = await checkUserSubscription(id);
        if (!checkSubscription) throw new NotFoundError('User does not have an active subscription');

        const subscription = await cancelSubscription(id);
        if (!subscription) throw new NotFoundError('Subscription not found');

        const fcmTokens = await fetchFcmTokenByUserId(id);

        console.log(fcmTokens);

        // Unsubscribe the FCM tokens
        if (fcmTokens.length > 0) {
            const tokens = fcmTokens.map(token => token.token);

            // Send FCM notification
            const notificationMessage: Notification = {
                title: 'Subscription canceled',
                body: 'Your subscription has been canceled',
            };

            // Send FCM notification
            await messaging().sendEachForMulticast({
                tokens: tokens as unknown as string[],
                notification: notificationMessage,
                android: {
                    notification: {
                        imageUrl: 'https://jkt48pm.my.id/static/logo_jkt48pm_2.png',
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            'mutable-content': 1,
                            sound: 'notification_sound.caf',
                        },
                    },
                    fcmOptions: {
                        imageUrl: 'https://jkt48pm.my.id/static/logo_jkt48pm_2.png',
                    },
                },
            });
        }

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Subscription canceled',
                data: subscription,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/transactionList', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const transactionList = await getUserTransactionList(id);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'User transaction list',
                data: transactionList,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/transactionDetail/:orderId', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;
        const orderId = req.params.orderId;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const order = await getOrderById(orderId);
        if (!order) throw new NotFoundError('Order not found');

        const transactionDetail = await getUserTransactionDetail(id, orderId);
        if (!transactionDetail) throw new NotFoundError('Transaction not found');

        // Parse callback_data from stringified JSON to object
        if (transactionDetail.callback_data) {
            transactionDetail.callback_data = JSON.parse(transactionDetail.callback_data as string);
        }

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'User transaction detail',
                data: transactionDetail,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/conversationList', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const conversationList = await getUserConversationList(id);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'User conversation list',
                data: conversationList,
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);

        next(error);
    }
});

router.get('/me/conversation/:conversationId', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;
        const conversationId = req.params.conversationId;

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const orderBy = (req.query.orderBy as string) || 'created_at';
        const orderDirection = (req.query.orderDirection as string) || 'DESC';

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        // Get the conversation list
        const conversationList = await getUserConversationList(id);
        if (!conversationList) throw new NotFoundError('Conversation not found');

        // Get the list of idols from the conversation list
        const idolList = conversationList.map(conversation => conversation.idol_id);

        // Check if the user is subscribed to any of the idols in the conversation
        const subscriptions = await Promise.all(
            idolList.map(idolId => checkUserSubscriptionOderIdol(id, idolId as string)),
        );

        // If the user is not subscribed to any of the idols, throw an error
        if (subscriptions.every(subscription => !subscription)) {
            throw new NotFoundError(
                'User does not have an active subscription to any of the idols in this conversation',
            );
        }

        // Get the conversation messages
        const conversation = await getUserConversationMessages(
            id,
            conversationId,
            orderBy,
            orderDirection,
            pageSize,
            page,
        );

        console.log(conversation);

        if (!conversation) throw new NotFoundError('Conversation not found');

        return res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                code: StatusCodes.OK,
                message: 'User conversation',
                data: conversation,
                meta: {
                    page,
                    pageSize,
                    orderBy,
                    orderDirection,
                },
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/me/conversation/:conversationId/images', authenticateUser, async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;

        const id = req.user.id;

        // Check if conversation id is valid uuid
        const isValidUuid = validateUuid(conversationId);
        if (!isValidUuid) throw new NotFoundError('ConversationId not valid (uuid)');

        // Check if the conversation exists
        const conversation = await getConversationsById(conversationId);
        if (!conversation) throw new NotFoundError('Conversation not found');

        const images = await getAllAttachmentsByConversationId(conversationId, id);
        if (!images) throw new NotFoundError('Images not found');

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Conversation images',
                data: images,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/me/getActiveIdols', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        const activeIdols = await getUserActiveIdols(id);
        if (!activeIdols) throw new NotFoundError('Active idols not found');

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Active idols',
                data: activeIdols,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.post('/me/reactMessage/:messageId', validateSchema(postReaction), authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;
        const messageId = req.params.messageId;
        const { reactionId } = req.body;

        // Let these functions throw errors if something goes wrong
        await getMessagesById(messageId);
        await getReactionById(reactionId);

        // Post the reaction
        await await setUserReactionToMessage(id, messageId, reactionId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Reaction posted',
                success: true,
                data: null,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.delete('/me/unReactMessage/:messageId/reaction/:reactionId', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;
        const messageId = req.params.messageId;
        const reactionId = req.params.reactionId;

        // Let these functions throw errors if something goes wrong
        await getMessagesById(messageId);
        await getReactionById(reactionId);

        // Post the reaction
        await deleteUserReactToMessage(id, messageId, reactionId);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Reaction removed',
                success: true,
                data: null,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/countRegistered', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const count = await countRegisteredUsers();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Count of registered users',
                data: count,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.get('/countActiveSubscriptions', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const count = await countActiveSubscriptionsUsers();

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Count of active subscriptions users',
                data: count,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.patch(
    '/me',
    authenticateUser,
    uploadUserProfile.single('profileImage'),
    validateSchema(updateUserSchema),
    async (req, res, next) => {
        try {
            const isValidUuid = validateUuid(req.user.id);
            if (!isValidUuid) throw new NotFoundError('UserId not valid (uuid)');
            const id = req.user.id;

            let fileName = null;
            if (req.file) {
                const filePath = `/static/profileImages/${req.user.roles}/${id}/`;
                fileName = filePath + 'profile-img-' + id + path.extname(req.file.originalname);
            }

            const { name, email, nickName, birthday } = req.body;

            const user = await updateUser(id, email, nickName, name, birthday, fileName);
            return res.status(StatusCodes.OK).send({ user });
        } catch (error) {
            next(error);
        }
    },
);

router.patch('/me/changePassword', validateSchema(changePasswordSchema), authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const { password, birthday } = req.body;

        console.log(password, birthday);

        // Check if the user exists
        const user = await getUserById(id);
        if (!user) throw new NotFoundError('User not found');

        // Change the password
        await updateUserPassword(id, password, birthday);

        return res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Password changed',
                data: null,
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);

        next(error);
    }
});

router.patch(
    '/me/changeAdminCredentials',
    validateSchema(changeAdminCredentialsSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const id = req.user.id;

            const { email, password } = req.body;

            const user = await getUserById(id);
            if (!user) throw new NotFoundError('User not found');

            await updateAdminCredentials(id, email, password);

            return res.status(StatusCodes.OK).send(
                formatResponse({
                    code: StatusCodes.OK,
                    message: 'Admin credentials changed',
                    data: null,
                    success: true,
                }),
            );
        } catch (error) {
            next(error);
        }
    },
);

// router.delete('/me/nuke', authenticateUser, async (req, res, next) => {
//     try {
//         const id = req.user.id;

//         const user = await getUserById(id);
//         if (!user) throw new NotFoundError('User not found');

//         await softDeleteUser(id);

//         res.status(StatusCodes.OK).send(
//             formatResponse({
//                 code: StatusCodes.OK,
//                 message: 'User deleted',
//                 data: null,
//                 success: true,
//             }),
//         );
//     } catch (error) {
//         next(error);
//     }
// });

export default router;
