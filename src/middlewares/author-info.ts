import { NextFunction, Request, Response } from 'express';

export const infoMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    const currentTime = new Date();
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Jakarta',
    };
    const formattedTime = currentTime.toLocaleString('id-ID', timeOptions);
    const formattedDate = currentTime.toLocaleString('id-ID', dateOptions);

    const diff = process.hrtime(start);
    const time = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2) + 'ms'; // convert to milliseconds and append 'ms'

    res.locals.info = {
        nodeJsVersion: process.version,
        currentTime: formattedTime,
        currentDate: formattedDate,
        pageLoadTime: time,
    };

    next();
};
