import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser, requireAdminRole, requireMemberRole } from '../../middlewares/authenticate-user';
import { validateSchema } from '../../middlewares/validate-request';
import { UnprocessableEntityError } from '../../utils/errors';
import { uploadMessage } from '../../utils/multer';
import { formatResponsePaginated } from '../../utils/response-formatter';
import { validateUuid } from '../../utils/validate';
import { deleteAttachment, getAttachmentsByMessageId } from '../attachment/repository';
import { approveMessage, createMessage, deleteMessage, getMessages, getMessagesById } from './repository';
import { approveOrRejectMessageSchema } from './schema';

const router = express.Router();

router.get('/:id', authenticateUser, requireAdminRole, async (req, res, next) => {
    try {
        const messageId = req.params.id;
        if (!validateUuid(messageId)) throw new UnprocessableEntityError('The message ID is not valid UUID');

        const message = await getMessagesById(messageId);

        res.status(StatusCodes.OK).send({
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

        console.log(messages);

        res.status(StatusCodes.OK).send(
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
        console.log(error);

        next(error);
    }
});

// TODO: Perlu dibatasi yang bisa post message itu yang sesuai dengan conversation id, Which is, user yang punya conversation id itu, atau admin
router.post('/', authenticateUser, requireMemberRole, uploadMessage.array('attachments'), async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { conversationId, messages } = req.body;

        const attachments = req.files as Express.Multer.File[];

        const formattedAttachments = attachments?.map(attachment => {
            const fileBuffer = fs.readFileSync(attachment.path);
            const hashSum = crypto.createHash('sha1');
            hashSum.update(fileBuffer);
            const checksum = hashSum.digest('hex');

            return {
                filePath: attachment.path, // path where the file is stored
                fileType: attachment.mimetype, // file type
                fileSize: attachment.size, // file size
                originalName: attachment.originalname, // original file name
                checksum: checksum, // checksum of the file
            };
        });

        const sendMessage = await createMessage(conversationId, userId, messages, formattedAttachments);

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Success create message',
            data: {
                sendMessage,
            },
        });
    } catch (error) {
        next(error);
    }
});

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

        res.status(StatusCodes.OK).send({
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
            const conversationId = req.params.id;
            if (!validateUuid(conversationId)) throw new UnprocessableEntityError('The message is not valid UUID');

            const { isApproved } = req.body;

            await approveMessage(conversationId, isApproved);

            res.status(StatusCodes.OK).send({
                success: true,
                code: StatusCodes.OK,
                message: isApproved === true ? 'Success approve message' : 'Success reject message',
                data: null,
            });
        } catch (error) {
            next(error);
        }
    },
);

export default router;
