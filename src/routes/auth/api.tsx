import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { appCheckVerification } from '../../middlewares/appcheck';
import { authenticateUser } from '../../middlewares/authenticate-user';
import { checkBlockedUserAgent } from '../../middlewares/ip-block';
import { rateLimiter, rateLimiterStrict } from '../../middlewares/rate-limiter';
import { validateSchema } from '../../middlewares/validate-request';
import { ConflictError } from '../../utils/errors';
import { generateResetTokenPassword, generateVerificationCode } from '../../utils/lib';
import { formatResponse } from '../../utils/response-formatter';
import { whitelistedEmails } from '../../utils/whitelisted-email';
import {
    checkDeleteStep,
    deleteAccountUser,
    forgotPasswordUser,
    getUser,
    getUserByDeleteToken,
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

        return res.status(StatusCodes.OK).send(
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

router.post(
    '/register',
    validateSchema(registerSchema),
    checkBlockedUserAgent,
    rateLimiter,
    appCheckVerification,
    async (req, res, next) => {
        try {
            const { email, password, name, birthday, nickName, phoneNumber } = req.body;

            const user = await getUser(email);
            if (user) throw new ConflictError('A user with that email already exists');

            const verificationToken =
                email in whitelistedEmails ? whitelistedEmails[email] : generateVerificationCode();

            const birthdayDate = birthday ? new Date(birthday) : new Date('1900-01-01');

            await registerUser(email, password, name, nickName, birthdayDate, verificationToken, phoneNumber);

            // const emailResult = await sendEmail({
            //     to: [email],
            //     subject: 'Confirm Your Email Address for New Account Registration',
            //     react: <RegisterAccountEmail validationCode={verificationToken} />,
            // });

            // if (emailResult.error) {
            //     return res.status(StatusCodes.NOT_FOUND).json({ error: emailResult.error });
            // }

            return res.status(StatusCodes.CREATED).json({ message: 'Langsung login aja ya :), Gak usah verifikasi' });
        } catch (error) {
            next(error);
        }
    },
);

router.post('/login', validateSchema(loginSchema), checkBlockedUserAgent, rateLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await verifyLogin(email, password);
        const accessToken = createAccessToken(user.id, user.email, user.name, user.roles, user.isDeleted);
        const refreshToken = createRefreshToken(user.id, user.email, user.name, user.roles);
        setRefreshCookie(res, refreshToken);

        return res.status(StatusCodes.OK).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', authenticateUser, async (req, res, next) => {
    try {
        // Invalidate the refresh token
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });

        return res.status(StatusCodes.OK).send({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const { id, email, name, roles, isDeleted } = verifyRefreshToken(refreshToken);
        const accessToken = createAccessToken(id, email, name, roles, isDeleted);

        return res.status(StatusCodes.OK).send({ accessToken });
    } catch (error) {
        next(error);
    }
});

router.post('/verifyToken', validateSchema(verifySchema), async (req, res, next) => {
    try {
        const { verificationToken } = req.body;

        await verifyUser(verificationToken);

        return res.status(StatusCodes.OK).json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
});

router.post(
    '/resend-verification',
    validateSchema(resendVerificationSchema),
    rateLimiterStrict,
    appCheckVerification,
    async (req, res, next) => {
        try {
            const { email } = req.body;

            const user = await getUser(email);
            if (!user) throw new ConflictError('A user with that email does not exist');

            // Check if the user is already verified
            if (user.emailVerified) throw new ConflictError('Email is already verified');

            // If the email is whitelisted, use the specific code, otherwise generate a new one
            const verificationToken =
                email in whitelistedEmails ? whitelistedEmails[email] : generateVerificationCode();

            await updateUserVerificationToken(email, verificationToken);

            // const emailResult = await sendEmail({
            //     to: [email],
            //     subject: 'Verify your email',
            //     react: <ResendVerificationEmail validationCode={verificationToken} />,
            // });

            // if (emailResult.error) {
            //     return res.status(StatusCodes.NOT_FOUND).json({ error: emailResult.error });
            // }

            return res.status(StatusCodes.OK).json({ message: 'Verification email sent successfully' });
        } catch (error) {
            next(error);
        }
    },
);

router.post(
    '/forgot_password',
    validateSchema(forgotPasswordSchema),
    rateLimiterStrict,
    appCheckVerification,
    async (req, res, next) => {
        try {
            const { email } = req.body;
            const randomStringToken = generateResetTokenPassword();

            const user = await getUser(email);

            if (!user) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email not found' });
            }

            if (user) await forgotPasswordUser(email, randomStringToken);

            // const emailResult = await sendEmail({
            //     to: [email],
            //     // to: ['zane.227@gmail.com'],
            //     subject: 'Your Reset Password Token',
            //     react: <ForgotPasswordEmail validationCode={randomStringToken} />,
            // });

            // if (emailResult.error) {
            //     return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
            // }

            return res
                .status(StatusCodes.OK)
                .json({ message: 'Registration in process, please login with email and password' });
        } catch (error) {
            next(error);
        }
    },
);

router.post(
    '/request_deletion',
    validateSchema(requestDeletionSchema),
    authenticateUser,
    appCheckVerification,
    rateLimiterStrict,
    appCheckVerification,
    async (req, res, next) => {
        try {
            const emailLoggedOn = req.user.email;

            const { email } = req.body;

            if (email !== emailLoggedOn) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email not match with logged on email' });
            }

            // const randomStringToken = generateResetTokenPassword();

            // If the email is whitelisted, use the specific code, otherwise generate a new one
            const randomStringToken =
                email in whitelistedEmails ? whitelistedEmails[email] : generateVerificationCode();

            const user = await getUser(email);
            if (user) await requestDeletionUser(email, randomStringToken);

            // const emailResult = await sendEmail({
            //     to: [email],
            //     subject: 'Your Account Deletion Token',
            //     react: <RequestDeletionEmail validationCode={randomStringToken} />,
            // });

            // if (emailResult.error) {
            //     return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
            // }

            return res.status(StatusCodes.OK).json({ message: 'Success send token to delete account' });
        } catch (error) {
            console.log(error);

            next(error);
        }
    },
);

router.post(
    '/reset_password',
    validateSchema(resetPasswordSchema),
    rateLimiterStrict,
    appCheckVerification,
    async (req, res, next) => {
        try {
            const { token, password } = req.body;
            // const user = await getUserByResetToken(token);
            if (token && password) await resetPasswordUser(token, password);

            // const emailResult = await sendEmail({
            //     to: [user.email],
            //     subject: 'Your Password Has Been Changed',
            //     // text: `Your Password successfully changed`,
            //     react: <ResetPasswordEmail />,
            // });

            // if (emailResult.error) {
            //     return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
            // }

            return res.status(StatusCodes.OK).json({ message: 'Success reset password' });
        } catch (error) {
            next(error);
        }
    },
);

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

            if (!user) {
                return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Token tidak cocok' });
            }

            console.log(user);

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

            // const emailResult = await sendEmail({
            //     to: [user.email],
            //     subject: 'Your Account Has Been Deleted',
            //     // text: `Your Account successfully deleted`,
            //     react: <DeleteAccountEmail />,
            // });

            // if (emailResult.error) {
            //     return res.status(StatusCodes.BAD_REQUEST).json({ error: emailResult.error });
            // }

            return res.status(StatusCodes.OK).json({ message: 'Success delete account' });
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
            return res.status(StatusCodes.OK).send({ datas: user });
        } else {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({ messages: `${email} not exist!` });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
