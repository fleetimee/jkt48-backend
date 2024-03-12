import express from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';

import { upload } from '../../utils/multer';
import { formatResponse } from '../../utils/response-formatter';

const router = express.Router();

router.post('/:urlParam(news|profile)', upload, (req, res, next) => {
    try {
        if (!req.file) {
            res.status(StatusCodes.BAD_REQUEST).send({ error: 'No file uploaded' });
            return;
        }
        const filePath = `/static/${req.params.urlParam}/${req.file.filename}`;

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'File uploaded successfully',
                data: {
                    url: filePath,
                },
                success: true,
            }),
        );
    } catch (error) {
        console.log(error);

        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            res.status(StatusCodes.FORBIDDEN).send({ error: 'File size exceeds the limit' });
        } else {
            next(error);
        }
    }
});

export default router;
