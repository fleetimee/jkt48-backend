/**
 * Generates a verification code consisting of alphanumeric characters.
 *
 * @returns The generated verification code.
 */
export function generateVerificationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let verificationCode = '';
    for (let i = 0; i < 6; i++) {
        verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return verificationCode;
}
