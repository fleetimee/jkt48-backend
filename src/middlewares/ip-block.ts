import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../utils/response-formatter';

export const ipBlockMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const blockedIps = ['118.99.84.2'];
    const xForwardedFor = req.headers['x-forwarded-for'] as string;
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.ip;

    if (blockedIps.includes(clientIp)) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    }

    next();
};

export function checkBlockedUserAgent(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'];
    const blockedUserAgents = [
        'curl',
        'axios',
        'postman',
        'insomnia',
        'node-fetch',
        'undici',
        'httpclient',
        'python-requests',
        'go-http-client',
        'java',
        'libwww-perl',
        'okhttp',
        'guzzlehttp',
        'httpie',
        'wget',
        'scrapy',
        'python-urllib',
        'mechanize',
        'phantomjs',
        'selenium',
        'cypress',
        'headless',
        'api testing',
        'scrapper',
    ];

    // Check if the user agent matches any of the blocked ones (flexible for versions or variations)
    if (userAgent && blockedUserAgents.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()))) {
        return res.status(StatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE).send(
            formatResponse({
                code: StatusCodes.INSUFFICIENT_SPACE_ON_RESOURCE,
                message: 'Insufficient space on resource',
                success: false,
                data: null,
            }),
        );
    }
    next();
}
