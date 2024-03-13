import { NextFunction, Request, Response } from 'express';

import {
    AUTHOR_DOCUMENTATION,
    AUTHOR_EMAIL,
    AUTHOR_NAME,
    AUTHOR_SERVICE_NAME,
    AUTHOR_SOCIAL_MEDIA,
    AUTHOR_WEBSITE,
} from '../config';

export const infoMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getDate()} ${currentTime.getMonth() + 1} ${currentTime.getFullYear()}`;

    res.locals.info = {
        currentTime: formattedTime,
        serviceName: AUTHOR_SERVICE_NAME,
        author: {
            name: AUTHOR_NAME,
            socialMedia: AUTHOR_SOCIAL_MEDIA,
            email: AUTHOR_EMAIL,
            website: AUTHOR_WEBSITE,
        },
        documentationLink: AUTHOR_DOCUMENTATION,
    };

    next();
};
