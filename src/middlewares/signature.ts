import CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';

const SERVER_CLIENT_SECRET = '$argon2id$v=19$m=16,t=2,p=1$dWkzYkxFbUdGNHVUN2piVQ$LS1pc1xfL/BeZbAS5mEs7A';

const validateSignatureMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Extract headers
    const apiClientSecret = req.headers['api-client-secret'] as string; // Secret key from the client header
    const signature = req.headers['signature-mitra'] as string; // The incoming signature to verify
    const timestamp = req.headers['timestamp-mitra'] as string; // Timestamp from request header
    const httpMethod = req.method;
    const requestUrl = req.originalUrl;

    // Check if the required headers are present
    if (!apiClientSecret || !signature || !timestamp) {
        return res.status(400).json({ message: 'Missing required headers' });
    }

    // Verify the client secret key matches the predefined server key
    if (apiClientSecret !== SERVER_CLIENT_SECRET) {
        return res.status(403).json({ message: 'Invalid client secret' });
    }

    // Construct the payload for HMAC signature verification
    const requestBody = req.method !== 'GET' ? JSON.stringify(req.body) : '';
    const payload = `path=${requestUrl}&verb=${httpMethod}&timestamp=${timestamp}&body=${requestBody}`;

    // Generate HMAC signature using SHA256 and encode it in Base64
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

    // Verify the signature
    if (signature !== expectedSignature) {
        return res.status(403).json({ message: 'Invalid signature' });
    }

    next();
};

export default validateSignatureMiddleware;
