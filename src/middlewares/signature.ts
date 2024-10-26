import CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment-timezone';

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

    // Parse the timestamp and verify it is within an acceptable range (e.g., 5 minutes)
    const requestTime = moment.tz(timestamp, 'Asia/Jakarta');
    const currentTime = moment().tz('Asia/Jakarta');

    const timeDifference = Math.abs(currentTime.diff(requestTime, 'minutes'));
    const allowedTimeDifference = 5; // 5 minutes tolerance for replay protection

    if (timeDifference > allowedTimeDifference) {
        return res.status(401).json({ message: 'Request timestamp is too far from server time' });
    }

    // Get the request body in string format
    const requestBody = JSON.stringify(req.body || '');

    // Helper function to extract the path
    function getPath(url: string): string {
        const pathRegex = /.+?:\/\/.+?(\/.+?)(?:#|\?|$)/;
        const result = url.match(pathRegex);
        return result && result.length > 1 ? result[1] : '';
    }

    const requestPath = getPath(requestUrl);

    // Recreate payload as in the original hashing process
    const payload = `path=${requestPath}&verb=${httpMethod}&timestamp=${timestamp}&body=${requestBody}`;

    // Generate HMAC signature with CryptoJS
    const hashed = CryptoJS.HmacSHA256(payload, apiClientSecret);
    const generatedSignature = CryptoJS.enc.Base64.stringify(hashed);

    // Compare the generated signature with the incoming signature
    if (generatedSignature !== signature) {
        return res.status(401).json({ message: 'Invalid signature' });
    }

    // Proceed to the next middleware if validation is successful
    next();
};

export default validateSignatureMiddleware;
