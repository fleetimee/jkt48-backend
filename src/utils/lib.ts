/**
 * Generates a verification code consisting of alphanumeric characters.
 *
 * @returns The generated verification code.
 */
export const generateVerificationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < 14; i++) {
        randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomString;
};
/**
 * Calculates the tax and total amount for a given price and tax rate.
 * @param price - The price of the item.
 * @param taxRate - The tax rate as a percentage.
 * @returns An object containing the calculated tax and total amount.
 */
export const calculateTaxAndTotal = (price: number, taxRate: number) => {
    const tax = Math.round(price * (taxRate / 100));
    const total = price + tax;
    return { tax, total };
};
