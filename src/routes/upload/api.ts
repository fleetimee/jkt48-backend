import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { upload } from '../../utils/multer';
import { formatResponse } from '../../utils/response-formatter';

const router = express.Router();

router.post('/:urlParam', upload.single('file'), (req, res, next) => {
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
        next(error);
    }
});

export default router;
