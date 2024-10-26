// import * as Sentry from '@sentry/node';
// import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { NextFunction, Request, Response } from 'express';
import { getAppCheck } from 'firebase-admin/app-check';

import { ENABLE_APP_CHECK } from '../config';

export interface FirebaseAppCheckError extends Error {
    errorInfo: {
        code: string; // The Firebase App Check error code
        message: string; // The error message
    };
    codePrefix: string; // The prefix (usually 'app-check')
}

export const appCheckVerification = async (req: Request, res: Response, next: NextFunction) => {
    if (ENABLE_APP_CHECK === 'false') {
        return next();
    }

    const appCheckToken = req.header('ip-token');

    if (!appCheckToken) {
        return res.status(401).json({
            status: 'error',
            message: 'No App Check token provided',
        });
    }

    try {
        const appCheckClaims = await getAppCheck().verifyToken(appCheckToken, { consume: true });

        if (appCheckClaims.alreadyConsumed) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        return next();
    } catch (err) {
        const appCheckError = err as FirebaseAppCheckError;

        console.error('Error verifying app check token:', appCheckError);

        if (appCheckError.errorInfo) {
            const { code, message } = appCheckError.errorInfo;
            switch (code) {
                case 'app-check/invalid-argument':
                    return res.status(400).json({
                        status: 'error',
                        code,
                        message,
                    });
                case 'app-check/token-expired':
                    return res.status(401).json({
                        status: 'error',
                        code,
                        message,
                    });
                case 'app-check/token-revoked':
                    return res.status(401).json({
                        status: 'error',
                        code,
                        message,
                    });
                case 'app-check/invalid-token':
                    return res.status(400).json({
                        status: 'error',
                        code,
                        message,
                    });
                case 'app-check/project-id-mismatch':
                    return res.status(403).json({
                        status: 'error',
                        code,
                        message,
                    });
                case 'app-check/certificate-check-failed':
                    return res.status(500).json({
                        status: 'error',
                        code,
                        message,
                    });
                default:
                    return res.status(500).json({
                        status: 'error',
                        code,
                        message: 'An unknown error occurred while verifying the App Check token.',
                    });
            }
        } else {
            return res.status(401).json({
                status: 'error',
                message: appCheckError.message || 'Unauthorized',
            });
        }
    }
};
