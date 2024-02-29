import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { BASE_URL } from '../../config';
import { rateLimiterStrict } from '../../middlewares/rate-limiter';
import { validate } from '../../middlewares/validate-request';
import { ConflictError } from '../../utils/errors';
import { generateResetTokenPassword, generateVerificationCode } from '../../utils/lib';
import { sendEmail } from '../../utils/send-emails';
import {
    forgotPasswordUser,
    getUser,
    getUserByTokenReset,
    registerUser,
    resetPasswordUser,
    verifyLogin,
    verifyUser,
} from './repository';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, verifySchema } from './schema';
import { createAccessToken, createRefreshToken, setRefreshCookie, verifyToken } from './utils';

const router = express.Router();

router.post('/register', validate(registerSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        const user = await getUser(email);
        if (user) throw new ConflictError('A user with that email already exists');

        // Generate a verification token and send an email to the user
        const verificationToken = generateVerificationCode();

        await registerUser(email, password, name, verificationToken);

        // Send verification email
        const emailResult = await sendEmail({
            // to: [email],
            to: ['zane.227@gmail.com'],
            subject: 'Verify your email',
            text: `Your verification token is: ${verificationToken}`,
        });

        if (emailResult.error) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: emailResult.error });
        }

        res.status(StatusCodes.CREATED).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/login', validate(loginSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await verifyLogin(email, password);
        const accessToken = createAccessToken(user.id, user.email, user.name, user.roles);
        const refreshToken = createRefreshToken(user.id, user.email, user.name);
        setRefreshCookie(res, refreshToken);

        res.status(StatusCodes.OK).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const { id, email, name, roles } = verifyToken(refreshToken);
        const accessToken = createAccessToken(id, email, name, roles);

        res.status(StatusCodes.OK).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/verifyToken', validate(verifySchema), async (req, res, next) => {
    try {
        const { email, verificationToken } = req.body;

        await verifyUser(email, verificationToken);

        res.status(StatusCodes.OK).json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
});

// Temporary
router.get('/user/detail/:email', rateLimiterStrict, async (req, res, next) => {
    const email = req.params.email;
    try {
        const user = await getUser(email);

        if (user) {
            res.status(StatusCodes.OK).send({ datas: user });
        } else {
            res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ messages: `${email} not exist!` });
        }
    } catch (error) {
        next(error);
    }
});

router.post('/forgot_password', validate(forgotPasswordSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email } = req.body;
        const randomStringToken = generateResetTokenPassword();

        const user = await getUser(email);
        if (user) await forgotPasswordUser(email, randomStringToken);

        const emailResult = await sendEmail({
            to: [email],
            subject: 'Your Reset Password Link here',
            text: `Please change your password here : ${BASE_URL}/reset_password?token=${randomStringToken}, please change it!`,
        });

        if (emailResult.error) {
            return res.status(400).json({ error: emailResult.error });
        }

        res.status(201).json({ message: 'Success send token to reset password' });
    } catch (error) {
        next(error);
    }
});

router.post('/reset_password', validate(resetPasswordSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const user = await getUserByTokenReset(token);
        if (token && password) await resetPasswordUser(token, password);

        const emailResult = await sendEmail({
            to: [user.email],
            subject: 'Password changed!',
            text: `Your Password successfully changed`,
        });

        if (emailResult.error) {
            return res.status(400).json({ error: emailResult.error });
        }

        res.status(201).json({ message: 'Success reset password' });
    } catch (error) {
        next(error);
    }
});

export default router;
