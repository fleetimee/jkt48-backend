import CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment-timezone';

import { redisClient } from './caching';

const SERVER_CLIENT_SECRET = '6ozHw3Q53W8c8U9cEDKUf6BEi2hgEz5j';

const validateSignatureMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // if (ENABLE_SIGNATURE_CHECK === 'false') {
    //     return next();
    // }

    const signature = req.headers['signature-mitra'] as string;
    const timestamp = req.headers['timestamp-mitra'] as string;
    const nonce = req.headers['nonce'] as string;
    const httpMethod = req.method;

    if (!signature || !timestamp || !nonce) {
        return res.status(400).json({ message: 'Missing required headers' });
    }

    const requestTime = moment.tz(timestamp, 'Asia/Jakarta');
    const currentTime = moment().tz('Asia/Jakarta');
    const timeDifference = currentTime.diff(requestTime, 'seconds');

    console.log('Request Time:', requestTime.format());
    console.log('Current Time:', currentTime.format());
    console.log('Time Difference (seconds):', timeDifference);

    if (timeDifference > 120) {
        return res.status(400).json({ message: 'Request expired' });
    }

    const signatureKey = `signature:${timestamp}:${nonce}`;
    const isUsed = await redisClient.exists(signatureKey);
    if (isUsed) {
        return res.status(403).json({ message: 'Signature already used' });
    }

    const requestBody = req.method !== 'GET' ? JSON.stringify(req.body) : '';

    const payload = `verb=${httpMethod}&timestamp=${timestamp}&nonce=${nonce}&body=${requestBody}`;

    const hmac = CryptoJS.HmacSHA256(payload, SERVER_CLIENT_SECRET);
    const expectedSignature = CryptoJS.enc.Base64.stringify(hmac);

    console.log('payload', payload);
    console.log('expectedSignature', expectedSignature);
    console.log('signature', signature);
    console.log('signatureKey', signatureKey);
    console.log('isUsed', isUsed);
    console.log('requestBody', requestBody);
    console.log('httpMethod', httpMethod);
    console.log('timestamp', timestamp);
    console.log('nonce', nonce);

    if (signature !== expectedSignature) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    await redisClient.set(signatureKey, 'used', 'EX', 120);

    next();
};

export default validateSignatureMiddleware;
