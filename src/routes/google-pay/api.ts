import express from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

const router = express.Router();

router.post('/verifyGoogle', async (req, res, next) => {
    try {
        const { body } = req;

        // Log the body
        const logData = `Body: ${JSON.stringify(body, null, 2)}\n`;

        const logDir = 'logs/body';
        const logFile = path.join(logDir, 'body.txt');

        fs.mkdir(logDir, { recursive: true }, err => {
            if (err) {
                console.error('Error creating log directory', err);
                return;
            }

            fs.appendFile(logFile, logData, err => {
                if (err) {
                    console.error('Error writing to log file', err);
                }
            });
        });

        res.status(StatusCodes.OK).send({
            success: true,
            code: StatusCodes.OK,
            message: 'Google Pay verified',
            data: null,
        });
    } catch (error) {
        next(error);
    }
});
