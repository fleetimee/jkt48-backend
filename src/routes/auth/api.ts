import express from 'express';

import { rateLimiterStrict } from '../../middlewares/rate-limiter';
import { validate } from '../../middlewares/validate-request';
import { ConflictError } from '../../utils/errors';
import { generateRandomStringPassword, generateVerificationCode } from '../../utils/lib';
import { sendEmail } from '../../utils/send-emails';
import { getUser, registerUser, resetPasswordUser, verifyLogin, verifyUser } from './repository';
import { loginSchema, registerSchema, resetPasswordSchema, verifySchema } from './schema';
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
            to: [email],
            subject: 'Verify your email',
            text: `Your verification token is: ${verificationToken}`,
        });

        if (emailResult.error) {
            return res.status(400).json({ error: emailResult.error });
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/login', validate(loginSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await verifyLogin(email, password);
        const accessToken = createAccessToken(user.id, user.email, user.name);
        const refreshToken = createRefreshToken(user.id, user.email, user.name);
        setRefreshCookie(res, refreshToken);

        res.status(200).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const { id, email, name } = verifyToken(refreshToken);
        const accessToken = createAccessToken(id, email, name);

        res.status(200).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/verifyToken', validate(verifySchema), async (req, res, next) => {
    try {
        const { email, verificationToken } = req.body;

        await verifyUser(email, verificationToken);

        res.status(200).json({ message: 'Email verified successfully' });
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
            res.status(200).send({ datas: user });
        } else {
            res.status(422).send({ messages: `${email} not exist!` });
        }
    } catch (error) {
        next(error);
    }
});

router.post('/reset_password', validate(resetPasswordSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email } = req.body;
        const randomStringPassword = generateRandomStringPassword();

        const user = await getUser(email);
        if (user) await resetPasswordUser(email, randomStringPassword);

        const emailResult = await sendEmail({
            to: [email],
            subject: 'Your New Password',
            text: `Your new password is: ${randomStringPassword}, please change it after login!`,
        });

        if (emailResult.error) {
            return res.status(400).json({ error: emailResult.error });
        }

        res.status(201).json({ message: 'Success resetting password' });
    } catch (error) {
        next(error);
    }
});

export default router;
