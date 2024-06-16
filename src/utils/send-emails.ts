import { Resend } from 'resend';

import { RESEND_EMAIL, RESEND_KEY, RESEND_SENDER } from '../config';

const resend = new Resend(RESEND_KEY);

/**
 * Sends an email.
 * @param {Object} options - The email options.
 * @param {string[]} options.to - The recipients of the email.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.text - The text content of the email.
 * @returns {Promise<Object>} - A promise that resolves to an object indicating the success or failure of the email sending.
 * @throws {Error} - If there is an error sending the email.
 */
export const sendEmail = async ({
    to,
    subject,
    text,
    react,
}: {
    to: string[];
    subject: string;
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    react?: any;
}) => {
    if (text && react) {
        throw new Error('Only one of text or react should be provided');
    }

    const { error } = await resend.emails.send({
        from: `${RESEND_SENDER} <${RESEND_EMAIL}>`,
        to,
        subject,
        text,
        react,
    });

    if (error) {
        return { success: false, error: `Failed to send email: ${error.message}` };
    }

    return { success: true };
};
