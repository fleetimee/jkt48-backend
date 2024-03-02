import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import db from '../../db';
import { users } from '../../models/users';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';

export const getUser = async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    return user;
};

export const verifyLogin = async (email: string, password: string) => {
    const user = await getUser(email);

    const isUserVerified = user?.emailVerified;
    if (!isUserVerified) throw new UnauthorizedError('Email is not verified yet!');

    if (!user) throw new UnauthorizedError('Invalid username or password');

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordIsValid) throw new UnauthorizedError('Invalid username or password');

    return user;
};

export const registerUser = async (
    email: string,
    password: string,
    name: string,
    birthday: Date,
    verificationToken: string,
) => {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({ email, name, passwordHash, birthday, verificationToken });
};

export const verifyUser = async (email: string, verificationToken: string) => {
    const user = await getUser(email);
    const dateNow = new Date();

    if (!user) throw new UnauthorizedError('Invalid verification token');

    if (user.verificationToken !== verificationToken) throw new UnauthorizedError('Invalid verification token');

    if (user.emailVerified) throw new BadRequestError('Email is already verified');

    await db.update(users).set({ emailVerified: true, emailVerifiedAt: dateNow }).where(eq(users.email, email));
};

export const forgotPasswordUser = async (email: string, token: string) => {
    const user = await getUser(email);

    if (!user) throw new UnauthorizedError('No user registered!');

    await db.update(users).set({ tokenResetPassword: token }).where(eq(users.email, email));
};

export const resetPasswordUser = async (token: string, password: string) => {
    const user = await getUserByTokenReset(token);
    if (!user) throw new UnauthorizedError('Token invalid / expired!');

    const passwordHash = await bcrypt.hash(password, 10);
    await db
        .update(users)
        .set({ passwordHash: passwordHash, tokenResetPassword: null })
        .where(eq(users.email, user.email));
};

export const getUserByTokenReset = async (token: string) => {
    const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email, tokenResetPassword: users.tokenResetPassword })
        .from(users)
        .where(eq(users.tokenResetPassword, token))
        .limit(1);

    return user;
};
