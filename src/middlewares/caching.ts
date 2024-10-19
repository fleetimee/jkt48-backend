import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';

const redisClient = new Redis({
    host: '152.42.224.68',
    port: 6379,
});

export const cacheMiddleware = (key: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                console.log(`Cache hit for ${key}`);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.parse(cachedData));
                return;
            }

            next();
        } catch (err) {
            console.error('Redis error:', err);
            next();
        }
    };
};

export const cacheResponse = async (key: string, data: any, expiration = 518400) => {
    try {
        console.log(`Caching response for ${key}`);
        await redisClient.set(key, JSON.stringify(data), 'EX', expiration);
    } catch (err) {
        console.error('Redis error:', err);
    }
};
