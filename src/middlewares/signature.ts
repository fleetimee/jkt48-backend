import CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';

import { redisClient } from './caching';

const SERVER_CLIENT_SECRET = '6ozHw3Q53W8c8U9cEDKUf6BEi2hgEz5j';

// Helper function to remove problematic characters from request body
const sanitizeBody = (body: string): string => {
    return body.replace(/[\n\r]/g, '').trim(); // Removes newline, carriage returns, and trims whitespace
};

const validateSignatureMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const apiClientSecret = req.headers['api-client-secret'] as string;
    const signature = req.headers['signature-mitra'] as string;
    const timestamp = req.headers['timestamp-mitra'] as string;
    const nonce = req.headers['nonce'] as string; // New nonce header
    const httpMethod = req.method;

    if (!apiClientSecret || !signature || !timestamp || !nonce) {
        return res.status(400).json({ message: 'Missing required headers' });
    }

    if (apiClientSecret !== SERVER_CLIENT_SECRET) {
        return res.status(403).json({ message: 'Invalid client secret' });
    }

    // Check if signature (nonce-timestamp pair) was used
    const signatureKey = `signature:${timestamp}:${nonce}`;
    const isUsed = await redisClient.exists(signatureKey);
    if (isUsed) {
        return res.status(403).json({ message: 'Signature already used' });
    }

    // Handle and sanitize request body
    let requestBody = req.method !== 'GET' ? JSON.stringify(req.body) : '';
    requestBody = sanitizeBody(requestBody);

    // Construct the payload to generate HMAC
    const payload = `verb=${httpMethod}&timestamp=${timestamp}&nonce=${nonce}&body=${requestBody}`;

    const hmac = CryptoJS.HmacSHA256(payload, SERVER_CLIENT_SECRET);
    const expectedSignature = CryptoJS.enc.Base64.stringify(hmac);

    if (signature !== expectedSignature) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    // Store the signature as used with expiration (e.g., 5 minutes)
    await redisClient.set(signatureKey, 'used', 'EX', 300); // Expire in 300 seconds (5 minutes)

    next();
};

export default validateSignatureMiddleware;
