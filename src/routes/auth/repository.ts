import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import db from '../../db';
import { fcmTokens } from '../../models/fcm_token';
import { users } from '../../models/users';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../../utils/errors';

/**
 * Retrieves a user from the database based on their email.
 * @param email - The email of the user to retrieve.
 * @returns The user object if found, otherwise undefined.
 */
export const getUser = async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    return user;
};

/**
 * Retrieves a user by their verification token.
 * @param verificationToken - The verification token of the user.
 * @returns The user object if found, otherwise undefined.
 */
export const getUserByVerificationToken = async (verificationToken: string) => {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, verificationToken)).limit(1);

    return user;
};

/**
 * Retrieves a user by their reset token.
 *
 * @param {string} token - The reset token of the user.
 * @returns {Promise<object>} - A promise that resolves to the user object.
 */
export const getUserByResetToken = async (token: string) => {
    const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email, tokenResetPassword: users.tokenResetPassword })
        .from(users)
        .where(eq(users.tokenResetPassword, token))
        .limit(1);

    return user;
};

/**
 * Retrieves a user by their delete token.
 * @param {string} token - The delete token of the user.
 * @returns {Promise<object>} - A promise that resolves to the user object.
 */
export const getUserByDeleteToken = async (token: string) => {
    const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email, tokenDeleteAccount: users.tokenDeleteAccount })
        .from(users)
        .where(eq(users.tokenDeleteAccount, token))
        .limit(1);

    return user;
};

/**
 * Verifies the login credentials of a user.
 *
 * @param email - The email address of the user.
 * @param password - The password of the user.
 * @returns The user object if the login credentials are valid.
 * @throws {ForbiddenError} If the user's email is not verified.
 * @throws {UnauthorizedError} If the username or password is invalid.
 */
export const verifyLogin = async (email: string, password: string) => {
    const user = await getUser(email);

    if (!user) throw new UnauthorizedError('Invalid username or password');

    const isUserVerified = user?.emailVerified;
    if (!isUserVerified) throw new ForbiddenError('Email is not verified yet!');

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordIsValid) throw new UnauthorizedError('Invalid username or password');

    const isUserDeleted = user?.isDeleted;
    if (isUserDeleted)
        throw new UnauthorizedError('This account has been deleted!, please contact support for more information.');

    return user;
};

/**
 * Registers a new user.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @param name - The name of the user.
 * @param nickName - The nickname of the user.
 * @param birthday - The birthday of the user.
 * @param verificationToken - The verification token for the user.
 */
export const registerUser = async (
    email: string,
    password: string,
    name: string,
    nickName: string,
    birthday: Date,
    verificationToken: string,
    phoneNumber: string,
) => {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({ email, name, passwordHash, birthday, nickName, verificationToken, phoneNumber });
};

/**
 * Verifies the user by updating the user's email verification status and token.
 * @param verificationToken - The verification token associated with the user.
 * @throws {UnauthorizedError} - If the verification token is invalid.
 * @throws {BadRequestError} - If the user's email is already verified.
 */
export const verifyUser = async (verificationToken: string) => {
    const user = await getUserByVerificationToken(verificationToken);
    const dateNow = new Date();

    if (!user) throw new UnauthorizedError('Invalid verification token');

    if (user.emailVerified) throw new BadRequestError('Email is already verified');

    await db
        .update(users)
        .set({ emailVerified: true, emailVerifiedAt: dateNow, verificationToken: null }) // set verificationToken to null
        .where(eq(users.verificationToken, verificationToken));
};

/**
 * Updates the verification token for a user.
 * @param email - The email of the user.
 * @param verificationToken - The new verification token.
 * @throws UnauthorizedError - If no user is registered with the given email.
 */
export const updateUserVerificationToken = async (email: string, verificationToken: string) => {
    const user = await getUser(email);

    if (!user) throw new UnauthorizedError('No user registered!');

    await db.update(users).set({ verificationToken: verificationToken }).where(eq(users.email, email));
};

/**
 * Sends a password reset email to the user with the specified email address.
 * @param email - The email address of the user.
 * @param token - The password reset token.
 * @throws {UnauthorizedError} If no user is registered with the provided email address.
 */
export const forgotPasswordUser = async (email: string, token: string) => {
    const user = await getUser(email);

    if (!user) throw new UnauthorizedError('No user registered!');

    await db.update(users).set({ tokenResetPassword: token }).where(eq(users.email, email));
};

/**
 * Requests deletion of a user account.
 * @param email - The email of the user.
 * @param token - The deletion token.
 * @throws UnauthorizedError if no user is registered with the provided email.
 */
export const requestDeletionUser = async (email: string, token: string) => {
    const user = await getUser(email);

    if (!user) throw new UnauthorizedError('No user registered!');

    await db
        .update(users)
        .set({ tokenDeleteAccount: token, deleteAccountStep: 'request' })
        .where(eq(users.email, email));
};

/**
 * Resets the password for a user using a token and a new password.
 * @param {string} token - The token used for password reset.
 * @param {string} password - The new password to set for the user.
 * @throws {UnauthorizedError} If the token is invalid or expired.
 */
export const resetPasswordUser = async (token: string, password: string) => {
    const user = await getUserByResetToken(token);
    if (!user) throw new UnauthorizedError('Token invalid / expired!');

    const passwordHash = await bcrypt.hash(password, 10);
    await db
        .update(users)
        .set({ passwordHash: passwordHash, tokenResetPassword: null })
        .where(eq(users.email, user.email));
};

/**
 * Deletes the user account.
 * @param token - The reset token for the user.
 * @throws {UnauthorizedError} If the token is invalid or expired.
 */
export const deleteAccountUser = async (token: string) => {
    const user = await getUserByDeleteToken(token);
    if (!user) throw new UnauthorizedError('Token invalid / expired!');

    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const emailParts = user.email.split('@');
    const newEmail = `${emailParts[0]}-deleted-${randomString}@${emailParts[1]}`;

    await db
        .update(users)
        .set({
            isDeleted: true,
            tokenDeleteAccount: null,
            deleteAccountStep: 'done',
            email: newEmail,
            phoneNumber: null,
            nickName: `delete-user-${randomString}`,
            name: `Deleted User-${randomString}`,
        })
        .where(eq(users.email, user.email));

    await db.delete(fcmTokens).where(eq(fcmTokens.userId, user.id));
};

/**
 * Checks the delete step for a user.
 * @param userId - The ID of the user.
 * @returns The user object with the delete step.
 * @throws UnauthorizedError if no user is registered.
 */
export const checkDeleteStep = async (userId: string) => {
    const [user] = await db
        .select({
            step: users.deleteAccountStep,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) throw new UnauthorizedError('No user registered!');

    return user;
};
