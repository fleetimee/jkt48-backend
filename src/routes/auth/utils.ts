import cookie from 'cookie';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { JWT_SECRET_KEY } from '../../config';
import { UnauthorizedError } from '../../utils/errors';

/**
 * Creates an access token for authentication.
 * @param id - The user ID.
 * @param email - The user's email.
 * @param name - The user's name.
 * @returns The access token.
 */
export const createAccessToken = (id: string, email: string, name: string, roles: string, isDeleted: boolean) => {
    const payload = { type: 'access', id, email, name, roles, isDeleted };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1y' });
    return token;
};

/**
 * Creates a refresh token.
 * @param id - The user ID.
 * @param email - The user email.
 * @param name - The user name.
 * @returns The refresh token.
 */
export const createRefreshToken = (id: string, email: string, name: string, roles: string) => {
    const payload = { type: 'refresh', id, email, name, roles };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '360d' });
    return token;
};

/**
 * Verifies the given token using the JWT_SECRET_KEY and returns the decoded payload.
 * If the token is invalid, an UnauthorizedError is thrown.
 *
 * @param token - The token to be verified.
 * @returns The decoded payload of the token.
 * @throws UnauthorizedError if the token is invalid.
 */
export const verifyToken = (token: string) => {
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY) as {
            type: string;
            id: string;
            email: string;
            name: string;
            roles: string;
            isDeleted: boolean;
        };

        // Check if the token is an access token
        if (decodedToken.type !== 'access') throw new UnauthorizedError('Invalid token type');

        return decodedToken;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token');
        } else {
            throw new UnauthorizedError('An error occurred while verifying the token');
        }
    }
};

/**
 * Verifies the given refresh token using the JWT_SECRET_KEY and returns the decoded payload.
 * If the token is invalid, an UnauthorizedError is thrown.
 *
 * @param token - The refresh token to be verified.
 * @returns The decoded payload of the refresh token.
 * @throws UnauthorizedError if the token is invalid.
 */
export const verifyRefreshToken = (token: string) => {
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET_KEY) as {
            type: string;
            id: string;
            email: string;
            name: string;
            roles: string;
            isDeleted: boolean;
        };

        // Check if the token is a refresh token
        if (decodedToken.type !== 'refresh') throw new UnauthorizedError('Invalid token type');

        return decodedToken;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token');
        } else {
            throw new UnauthorizedError('An error occurred while verifying the token');
        }
    }
};

/**
 * Sets the refresh token as a cookie in the response.
 *
 * @param res - The response object.
 * @param refreshToken - The refresh token to be set as a cookie.
 */
export const setRefreshCookie = (res: Response, refreshToken: string) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    res.setHeader(
        'Set-Cookie',
        cookie.serialize('refreshToken', refreshToken, {
            httpOnly: true,
            expires: date,
            sameSite: 'none',
            secure: true,
            path: '/',
        }),
    );
};
