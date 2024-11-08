import express from 'express';
import { messaging } from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

import { BASE_URL } from '../../config';
import { authenticateUser, requireAdminRole, requireMemberRole } from '../../middlewares/authenticate-user';
import { redisClient } from '../../middlewares/caching';
import { validateSchema } from '../../middlewares/validate-request';
import { UnprocessableEntityError } from '../../utils/errors';
import { processUserBirthday } from '../../utils/process-birthday';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { deleteAttachment, getAttachmentsByMessageId } from '../attachment/repository';
import { checkBirthday, fetchTodayBirthdayUsers } from '../user/repository';
import {
    approveAllUserMessages,
    approveMessage,
    deleteMessage,
    getMessageDetail,
    getMessages,
    getMessagesById,
    insertBirthdayMessage,
} from './repository';
import { approveAllMessagesSchema, approveOrRejectMessageSchema, insertBirthdayMessageSchema } from './schema';

const router = express.Router();

router.get('/executeBirthdayScheduler', async (req, res, next) => {
    try {
        const [userBirthday] = await checkBirthday();

        if (!userBirthday.is_birthday_today) {
            return res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'No birthdays today',
                data: null,
            });
            return;
        }

        const userIds = await fetchTodayBirthdayUsers();

        if (!userIds) {
            return res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'No users found',
                data: null,
            });
            return;
        }

        for (const user of userIds) {
            await processUserBirthday(user);
        }

        return res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success check birthday',
            data: null,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/:id', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const messageId = req.params.id;
        if (!validateUuid(messageId)) throw new UnprocessableEntityError('The message ID is not valid UUID');

        const message = await getMessagesById(messageId);

        return res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success fetch message',
            data: message,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/conversation/:id', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const id = req.user.id;

        const conversationId = req.params.id;
        if (!validateUuid(conversationId)) throw new UnprocessableEntityError('The conversation ID is not valid UUID');

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;

        const offset = (page - 1) * pageSize;

        const messages = await getMessages(id, conversationId, pageSize, offset);

        return res.status(StatusCodes.OK).send(
            formatResponsePaginated({
                success: true,
                code: StatusCodes.OK,
                message: 'Success fetch messages',
                data: messages,
                meta: {
                    page,
                    pageSize,
                    orderBy: 'created_at',
                    orderDirection: 'DESC',
                },
            }),
        );
    } catch (error) {
        next(error);
    }
});

// TODO: Perlu dibatasi yang bisa post message itu yang sesuai dengan conversation id, Which is, user yang punya conversation id itu, atau admin
// router.post('/', authenticateUser, requireMemberRole, uploadMessage.array('attachments'), async (req, res, next) => {
//     try {
//         const userId = req.user.id;

//         const { conversationId, messages } = req.body;

//         const attachments = req.files as Express.Multer.File[];

//         const formattedAttachments = attachments?.map(attachment => {
//             const fileBuffer = fs.readFileSync(attachment.path);
//             const hashSum = crypto.createHash('sha1');
//             hashSum.update(fileBuffer);
//             const checksum = hashSum.digest('hex');

//             return {
//                 filePath: attachment.path, // path where the file is stored
//                 fileType: attachment.mimetype, // file type
//                 fileSize: attachment.size, // file size
//                 originalName: attachment.originalname, // original file name
//                 checksum: checksum, // checksum of the file
//             };
//         });

//         const sendMessage = await createMessage(conversationId, userId, messages, formattedAttachments);

//         res.status(StatusCodes.OK).send({
//             success: true,
//             code: StatusCodes.OK,
//             message: 'Success create message',
//             data: {
//                 sendMessage,
//             },
//         });
//     } catch (error) {
//         next(error);
//     }
// });

router.post('/insertBirthdayMessage', validateSchema(insertBirthdayMessageSchema), async (req, res, next) => {
    try {
        const { userId, idolId, personalizedMessage } = req.body;

        await insertBirthdayMessage(userId, idolId, personalizedMessage);

        return res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success insert birthday message',
            data: null,
        });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/approveAll',
    validateSchema(approveAllMessagesSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const { conversationId } = req.body;

            await approveAllUserMessages(conversationId);

            return res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: 'Success approve all message',
                data: null,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
);

router.delete('/:id', authenticateUser, requireMemberRole, async (req, res, next) => {
    try {
        const messageId = req.params.id;
        if (!validateUuid(messageId)) throw new UnprocessableEntityError('The message ID is not valid UUID');

        const message = await getMessagesById(messageId);
        if (!message) throw new UnprocessableEntityError('The message is not found');

        const attachment = await getAttachmentsByMessageId(messageId);
        if (attachment) {
            for (const attach of attachment) {
                await deleteAttachment(attach.id);
                fs.unlinkSync(attach.filePath);
            }
        }

        await deleteMessage(messageId);

        return res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success delete message',
            data: null,
        });
    } catch (error) {
        next(error);
    }
});

const notificationQueue: { idolId: string; notificationMessage: Notification; buildAvatar: string }[] = [];

// Function to process batched notifications
const processNotificationQueue = () => {
    setInterval(async () => {
        if (notificationQueue.length > 0) {
            const notifications = [...notificationQueue];
            notificationQueue.length = 0;

            // Group notifications by idolId
            const idolGroups = notifications.reduce(
                (acc, notification) => {
                    const { idolId } = notification;
                    if (!acc[idolId]) acc[idolId] = [];
                    acc[idolId].push(notification);
                    return acc;
                },
                {} as Record<string, typeof notificationQueue>,
            );

            // Send notifications for each idolId with Redis deduplication
            for (const idolId in idolGroups) {
                const { notificationMessage, buildAvatar } = idolGroups[idolId][0]; // Take the first message for each idol

                // Redis key for deduplication based on idolId
                const redisKey = `notifyUser:idol:${idolId}:message`;
                const keyExists = await redisClient.get(redisKey);

                if (!keyExists) {
                    // Send the FCM notification
                    await sendNotificationToIdolTopic(idolId, notificationMessage, buildAvatar);

                    // Set Redis key with a 5-second expiration to prevent duplicates
                    await redisClient.set(redisKey, '1', 'EX', 60);

                    // Delay between messages for each idol
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }
    }, 5000); // Process queue every 5 seconds
};

// Start processing the queue in the background
processNotificationQueue();

router.patch(
    '/:id/approveOrReject',
    validateSchema(approveOrRejectMessageSchema),
    authenticateUser,
    requireAdminRole,
    async (req, res, next) => {
        try {
            const messageId = req.params.id;
            if (!validateUuid(messageId)) throw new UnprocessableEntityError('The message is not valid UUID');

            const { isApproved } = req.body;

            const [approveMessageRes, messageDetail] = await Promise.all([
                approveMessage(messageId, isApproved),
                getMessageDetail(messageId),
            ]);

            if (isApproved) {
                const idolId = messageDetail.idol_id;
                const notificationMessage: Notification = {
                    title: messageDetail.nickname as string,
                    body: messageDetail.message ? (messageDetail.message as string) : 'You have a new message!',
                };
                const buildAvatar = `${BASE_URL}${messageDetail.profile_image}`;
                console.log('Build Avatar:', buildAvatar);

                // Add notification to batch queue
                notificationQueue.push({ idolId: idolId as string, notificationMessage, buildAvatar });
            }

            return res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: isApproved ? 'Success approve message' : 'Success reject message',
                data: approveMessageRes,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
);

const sendNotificationToIdolTopic = async (idolId: string, notificationMessage: Notification, buildAvatar: string) => {
    const topicName = `idol_${idolId}`;

    console.log(`Sending notification to topic: ${topicName}`);
    console.log(`Notification Message:`, notificationMessage);
    console.log(`Avatar URL: ${buildAvatar}`);

    try {
        const response = await messaging().send({
            topic: topicName,
            notification: notificationMessage,
            android: {
                notification: {
                    imageUrl: buildAvatar,
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
                    imageUrl: buildAvatar,
                },
            },
        });

        console.log(`Notification sent successfully to topic: ${topicName}`);
        console.log(`FCM Response:`, response);
    } catch (error) {
        console.error(`Error sending notification to topic: ${topicName}`);
        console.error(`Error details:`, error);
    }
};

// const isFCMError = (
//     error: any,
// ): error is {
//     code: string;
//     message: string;
//     response?: { headers?: { 'retry-after'?: string } };
// } => {
//     return typeof error?.code === 'string' && typeof error?.message === 'string';
// };

// const sendNotificationsInBackground = async (
//     tokenChunks: string[][],
//     notificationMessage: Notification,
//     buildAvatar: string,
// ) => {
//     const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
//     const maxRetries = 5;
//     const maxRPS = 5000; // Max Requests Per Second based on FCM limits
//     const maxDelay = 60000; // Maximum delay cap (60 seconds)
//     const notificationDelay = 120000; // 2 minutes delay between sending each chunk

//     // Ramp-up schedule configuration
//     const rampUpSchedule = [
//         { step: 0, percentage: 0.01, duration: 3600 * 1000 }, // 1% ramp-up over 1 hour
//         { step: 1, percentage: 0.05, duration: 7200 * 1000 }, // 5% ramp-up over 2 hours
//         { step: 2, percentage: 0.1, duration: 7200 * 1000 }, // 10% ramp-up over 2 hours
//         { step: 3, percentage: 0.25, duration: 10800 * 1000 }, // 25% ramp-up over 3 hours
//         { step: 4, percentage: 0.5, duration: 21600 * 1000 }, // 50% ramp-up over 6 hours
//         { step: 5, percentage: 0.75, duration: 21600 * 1000 }, // 75% ramp-up over 6 hours
//         { step: 6, percentage: 1.0, duration: 21600 * 1000 }, // 100% ramp-up over 6 hours
//     ];

//     const sendChunkWithRetries = async (tokenChunk: string[], attempt = 0) => {
//         try {
//             await messaging().sendEachForMulticast({
//                 tokens: tokenChunk,
//                 notification: notificationMessage,
//                 android: {
//                     notification: {
//                         imageUrl: buildAvatar,
//                         sound: 'default',
//                     },
//                 },
//                 apns: {
//                     payload: {
//                         aps: {
//                             'mutable-content': 1,
//                             sound: 'notification_sound.caf',
//                         },
//                     },
//                     fcmOptions: {
//                         imageUrl: buildAvatar,
//                     },
//                 },
//             });
//         } catch (error) {
//             if (isFCMError(error)) {
//                 if (
//                     error.code === 'messaging/quota-exceeded' ||
//                     error.code === 'messaging/server-unavailable' ||
//                     error.code === 'messaging/unknown-error'
//                 ) {
//                     const retryAfter = error?.response?.headers?.['retry-after'];
//                     let retryDelay = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * Math.pow(2, attempt);

//                     // Cap the delay to a maximum value and add jittering
//                     retryDelay = Math.min(retryDelay, maxDelay) * (0.8 + Math.random() * 0.4);

//                     console.error(`Error sending notification for chunk on attempt ${attempt}: ${error.message}`);
//                     console.log(`Retrying chunk after ${retryDelay} ms...`);
//                     if (attempt < maxRetries) {
//                         await delay(retryDelay);
//                         return sendChunkWithRetries(tokenChunk, attempt + 1);
//                     } else {
//                         console.error(`Max retries reached for this chunk. Skipping...`);
//                     }
//                 } else {
//                     console.error(`Non-retryable error occurred: ${error.message}`);
//                 }
//             } else {
//                 console.error(`An unknown error occurred: ${JSON.stringify(error)}`);
//             }
//         }
//     };

//     const avoidOnTheHourTraffic = async () => {
//         const now = new Date();
//         const minutes = now.getMinutes();
//         const seconds = now.getSeconds();

//         if (
//             (minutes >= 0 && minutes < 2) ||
//             (minutes >= 15 && minutes < 17) ||
//             (minutes >= 30 && minutes < 32) ||
//             (minutes >= 45 && minutes < 47)
//         ) {
//             const waitTime = ((2 - (minutes % 15)) * 60 - seconds) * 1000;
//             console.log(`Waiting ${waitTime / 1000} seconds to avoid peak traffic...`);
//             await delay(waitTime);
//         }
//     };

//     let currentStep = 0;
//     let currentRPS = 0;
//     let stepStartTime = Date.now();

//     const adjustDelayAndRPS = (index: number) => {
//         const stepInfo = rampUpSchedule[currentStep];
//         const elapsedTime = Date.now() - stepStartTime;

//         if (elapsedTime >= stepInfo.duration) {
//             if (currentStep < rampUpSchedule.length - 1) {
//                 currentStep++;
//                 stepStartTime = Date.now(); // Reset the start time for the next step
//             }
//         }

//         const targetRPS = maxRPS * stepInfo.percentage;

//         if (currentRPS < targetRPS) {
//             currentRPS += maxRPS * 0.01; // Increase RPS by 1% of max per iteration
//         } else {
//             currentRPS = targetRPS;
//         }

//         // Calculate delay based on the current RPS and chunk index
//         const delayTime = Math.max((1000 / currentRPS) * (index + 1), 200);
//         console.log(
//             `Step ${currentStep}, Target RPS: ${targetRPS}, Actual RPS: ${currentRPS}, Delay for index ${index}: ${delayTime} ms`,
//         );
//         return delayTime;
//     };

//     const promises = tokenChunks.map(async (tokenChunk, index) => {
//         await avoidOnTheHourTraffic();

//         const delayTime = adjustDelayAndRPS(index);
//         await delay(delayTime);

//         // Adding a delay of 2 minutes before processing the next chunk
//         if (index > 0) {
//             console.log(`Waiting for ${notificationDelay / 1000} seconds before sending the next chunk...`);
//             await delay(notificationDelay);
//         }

//         await sendChunkWithRetries(tokenChunk);
//     });

//     await Promise.all(promises);
// };

export default router;
