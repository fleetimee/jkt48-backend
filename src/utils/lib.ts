/**
 * Generates a verification code consisting of alphanumeric characters.
 *
 * @returns The generated verification code.
 */
export const generateVerificationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let verificationCode = '';
    for (let i = 0; i < 6; i++) {
        verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return verificationCode;
};

/**
 * Generates a random string consisting of alphanumeric characters.
 *
 * @returns The generated random string.
 */
export const generateResetTokenPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 14; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomString;
};
