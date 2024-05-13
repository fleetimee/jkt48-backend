import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { authenticateUser } from '../../middlewares/authenticate-user';
import { rateLimiterStrict } from '../../middlewares/rate-limiter';
import { validateSchema } from '../../middlewares/validate-request';
import { ConflictError } from '../../utils/errors';
import { generateResetTokenPassword, generateVerificationCode } from '../../utils/lib';
import { formatResponse } from '../../utils/response-formatter';
import { sendEmail } from '../../utils/send-emails';
import {
    checkDeleteStep,
    deleteAccountUser,
    forgotPasswordUser,
    getUser,
    getUserByDeleteToken,
    getUserByResetToken,
    registerUser,
    requestDeletionUser,
    resetPasswordUser,
    updateUserVerificationToken,
    verifyLogin,
    verifyUser,
} from './repository';
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    requestDeletionSchema,
    resendVerificationSchema,
    resetPasswordSchema,
    verifyDeletionSchema,
    verifySchema,
} from './schema';
import { createAccessToken, createRefreshToken, setRefreshCookie, verifyRefreshToken } from './utils';

const router = express.Router();

router.get('/checkAccountDeletionStatus', authenticateUser, async (req, res, next) => {
    try {
        const id = req.user.id;

        const deletionStatus = await checkDeleteStep(id);

        res.status(StatusCodes.OK).send(
            formatResponse({
                code: StatusCodes.OK,
                message: 'Success get deletion status',
                data: deletionStatus,
                success: true,
            }),
        );
    } catch (error) {
        next(error);
    }
});

router.post('/register', validateSchema(registerSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email, password, name, birthday, nickName, phoneNumber } = req.body;

        const user = await getUser(email);
        if (user) throw new ConflictError('A user with that email already exists');

        const verificationToken = generateVerificationCode();

        const birthdayDate = new Date(birthday);

        await registerUser(email, password, name, nickName, birthdayDate, verificationToken, phoneNumber);

        const emailResult = await sendEmail({
            to: [email],
            // to: ['zane.227@gmail.com'],
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

router.post('/login', validateSchema(loginSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await verifyLogin(email, password);
        const accessToken = createAccessToken(user.id, user.email, user.name, user.roles, user.isDeleted);
        const refreshToken = createRefreshToken(user.id, user.email, user.name, user.roles);
        setRefreshCookie(res, refreshToken);

        res.status(StatusCodes.OK).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', authenticateUser, async (req, res, next) => {
    try {
        // Invalidate the refresh token
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });

        res.status(StatusCodes.OK).send({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const { id, email, name, roles, isDeleted } = verifyRefreshToken(refreshToken);
        const accessToken = createAccessToken(id, email, name, roles, isDeleted);

        res.status(StatusCodes.OK).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/verifyToken', validateSchema(verifySchema), async (req, res, next) => {
    try {
        const { verificationToken } = req.body;

        await verifyUser(verificationToken);

        res.status(StatusCodes.OK).json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/resend-verification',
    validateSchema(resendVerificationSchema),
    rateLimiterStrict,
    async (req, res, next) => {
        try {
            const { email } = req.body;

            const user = await getUser(email);
            if (!user) throw new ConflictError('A user with that email does not exist');

            // Check if the user is already verified
            if (user.emailVerified) throw new ConflictError('Email is already verified');

            const verificationToken = generateVerificationCode();

            await updateUserVerificationToken(email, verificationToken);

            const emailResult = await sendEmail({
                to: [email],
                subject: 'Verify your email',
                text: `Your verification token is: ${verificationToken}`,
            });

            if (emailResult.error) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: emailResult.error });
            }

            res.status(StatusCodes.OK).json({ message: 'Verification email sent successfully' });
        } catch (error) {
            next(error);
        }
    },
);

router.post('/forgot_password', validateSchema(forgotPasswordSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { email } = req.body;
        const randomStringToken = generateResetTokenPassword();

        const user = await getUser(email);
        if (user) await forgotPasswordUser(email, randomStringToken);

        const emailResult = await sendEmail({
            to: [email],
            // to: ['zane.227@gmail.com'],
            subject: 'Your Reset Password Token',
            text: `Your reset password token is: ${randomStringToken}, use this token to reset your password.`,
        });

        if (emailResult.error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
        }

        res.status(StatusCodes.OK).json({ message: 'Success send token to reset password' });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/request_deletion',
    validateSchema(requestDeletionSchema),
    rateLimiterStrict,
    authenticateUser,
    async (req, res, next) => {
        try {
            const emailLoggedOn = req.user.email;

            const { email } = req.body;

            if (email !== emailLoggedOn) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email not match with logged on email' });
            }

            const randomStringToken = generateResetTokenPassword();

            const user = await getUser(email);
            if (user) await requestDeletionUser(email, randomStringToken);

            const emailResult = await sendEmail({
                to: [email],
                subject: 'Your Delete Account Token',
                text: `Your delete account token is: ${randomStringToken}, use this token to delete your account.`,
            });

            if (emailResult.error) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
            }

            res.status(StatusCodes.OK).json({ message: 'Success send token to delete account' });
        } catch (error) {
            next(error);
        }
    },
);

router.post('/reset_password', validateSchema(resetPasswordSchema), rateLimiterStrict, async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const user = await getUserByResetToken(token);
        if (token && password) await resetPasswordUser(token, password);

        const emailResult = await sendEmail({
            to: [user.email],
            subject: 'Password changed!',
            text: `Your Password successfully changed`,
        });

        if (emailResult.error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
        }

        res.status(StatusCodes.OK).json({ message: 'Success reset password' });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/verify_deletion',
    validateSchema(verifyDeletionSchema),
    rateLimiterStrict,
    authenticateUser,
    async (req, res, next) => {
        try {
            const emailLoggedOn = req.user.email;

            const { token } = req.body;

            const user = await getUserByDeleteToken(token);

            if (emailLoggedOn !== user.email) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email not match with logged on email' });
            }

            // Check if token is match with user
            if (user.tokenDeleteAccount !== token) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ error: 'Token delete tidak cocok dengan yang ada di database' });
            }

            if (token) await deleteAccountUser(token);

            const emailResult = await sendEmail({
                to: [user.email],
                subject: 'Account Deleted!',
                text: `Your Account successfully deleted`,
            });

            if (emailResult.error) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
            }

            res.status(StatusCodes.OK).json({ message: 'Success delete account' });
        } catch (error) {
            next(error);
        }
    },
);

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

export default router;
