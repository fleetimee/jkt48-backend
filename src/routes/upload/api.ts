import express from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import sharp from 'sharp';

import { upload } from '../../utils/multer';
import { formatResponse } from '../../utils/response-formatter';

const router = express.Router();

router.post('/:urlParam(news|profile)', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(StatusCodes.BAD_REQUEST).send({ error: 'No file uploaded' });
            return;
        }
        const filePath = `/static/${req.params.urlParam}/${req.file.filename}`;

        if (req.file.mimetype.startsWith('image/')) {
            const tempOutputPath = `${req.file.path}_temp`; // Create a temporary output path
            await sharp(req.file.path)
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toFile(tempOutputPath); // Write to the temporary file
            fs.renameSync(tempOutputPath, req.file.path); // Replace the original file with the temporary one
        }

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
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            res.status(StatusCodes.FORBIDDEN).send({ error: 'File size exceeds the limit' });
        } else {
            next(error);
        }
    }
});

export default router;
