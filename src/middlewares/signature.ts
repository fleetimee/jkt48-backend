import CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';

import { redisClient } from './caching';

const SERVER_CLIENT_SECRET = '6ozHw3Q53W8c8U9cEDKUf6BEi2hgEz5j';

const sanitizeBody = (body: string): string => {
    return body.replace(/[\n\r]/g, '').trim();
};

const validateSignatureMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['signature-mitra'] as string;
    const timestamp = req.headers['timestamp-mitra'] as string;
    const nonce = req.headers['nonce'] as string;
    const httpMethod = req.method;

    if (!signature || !timestamp || !nonce) {
        return res.status(400).json({ message: 'Missing required headers' });
    }

    const signatureKey = `signature:${timestamp}:${nonce}`;
    const isUsed = await redisClient.exists(signatureKey);
    if (isUsed) {
        return res.status(403).json({ message: 'Signature already used' });
    }

    let requestBody = req.method !== 'GET' ? JSON.stringify(req.body) : '';
    requestBody = sanitizeBody(requestBody);

    const payload = `verb=${httpMethod}&timestamp=${timestamp}&nonce=${nonce}&body=${requestBody}`;

    const hmac = CryptoJS.HmacSHA256(payload, SERVER_CLIENT_SECRET);
    const expectedSignature = CryptoJS.enc.Base64.stringify(hmac);

    if (signature !== expectedSignature) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    await redisClient.set(signatureKey, 'used', 'EX', 300);

    next();
};

export default validateSignatureMiddleware;
