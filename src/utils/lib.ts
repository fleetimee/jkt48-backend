import fs from 'fs';
import path from 'path';

/**
 * Generates a verification code consisting of alphanumeric characters.
 *
 * @returns The generated verification code.
 */
export const generateVerificationCode = () => {
    let verificationCode = '';
    for (let i = 0; i < 6; i++) {
        verificationCode += Math.floor(Math.random() * 10); // Generate a random number between 0 and 9
    }
    return verificationCode;
};
/**
 * Generates a random string consisting of alphanumeric characters.
 *
 * @returns The generated random string.
 */
export const generateResetTokenPassword = () => {
    let resetToken = '';
    for (let i = 0; i < 6; i++) {
        resetToken += Math.floor(Math.random() * 10); // Generate a random number between 0 and 9
    }
    return resetToken;
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

export function loadRootCAs() {
    const certPath = path.join(__dirname, '../../src/config/apple_root.pem');

    return [fs.readFileSync(certPath)];
}
