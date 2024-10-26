import CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';

const SERVER_CLIENT_SECRET = '6ozHw3Q53W8c8U9cEDKUf6BEi2hgEz5j';

const validateSignatureMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiClientSecret = req.headers['api-client-secret'] as string;
    const signature = req.headers['signature-mitra'] as string;
    const timestamp = req.headers['timestamp-mitra'] as string;
    const httpMethod = req.method;
    const requestUrl = req.originalUrl;

    console.log('API Client Secret:', apiClientSecret);

    if (!apiClientSecret || !signature || !timestamp) {
        return res.status(400).json({ message: 'Missing required headers' });
    }

    if (apiClientSecret != SERVER_CLIENT_SECRET) {
        return res.status(403).json({ message: 'Invalid client secret' });
    }

    const requestBody = req.method !== 'GET' ? JSON.stringify(req.body) : '';
    const payload = `path=${requestUrl}&verb=${httpMethod}&timestamp=${timestamp}&body=${requestBody}`;

    const hmac = CryptoJS.HmacSHA256(payload, SERVER_CLIENT_SECRET);
    const expectedSignature = CryptoJS.enc.Base64.stringify(hmac);

    console.log('Payload:', payload);
    console.log('Expected Signature:', expectedSignature);
    console.log('Incoming Signature:', signature);
    console.log('Timestamp:', timestamp);
    console.log('HTTP Method:', httpMethod);
    console.log('Request URL:', requestUrl);
    console.log('Request Body:', requestBody);
    console.log('API Client Secret:', apiClientSecret);

    if (signature !== expectedSignature) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    next();
};

export default validateSignatureMiddleware;
