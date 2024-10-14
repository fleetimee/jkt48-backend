import express from 'express';
import { messaging } from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

import { BASE_URL } from '../../config';
import { authenticateUser, requireAdminRole, requireMemberRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { UnprocessableEntityError } from '../../utils/errors';
import { processUserBirthday } from '../../utils/process-birthday';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { deleteAttachment, getAttachmentsByMessageId } from '../attachment/repository';
import { fetchSubscribedFcmTokens } from '../token/repository';
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

            // await approveMessage(messageId, isApproved);

            const [approveMessageRes, userFcmTokens, messageDetail] = await Promise.all([
                approveMessage(messageId, isApproved),
                fetchSubscribedFcmTokens(messageId),
                getMessageDetail(messageId),
            ]);

            if (userFcmTokens.length > 0 && isApproved) {
                const arrayOfStrings = userFcmTokens.map(item => item.token);

                const notificationMessage: Notification = {
                    title: messageDetail.nickname as string,
                    body: messageDetail.message ? (messageDetail.message as string) : 'You have a new message!',
                };

                const buildAvatar = `${BASE_URL}${messageDetail.profile_image}`;

                await messaging().sendEachForMulticast({
                    tokens: arrayOfStrings as unknown as string[],
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
            }

            return res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: isApproved === true ? 'Success approve message' : 'Success reject message',
                data: approveMessageRes,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
);

export default router;
