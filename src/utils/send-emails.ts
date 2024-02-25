import { Resend } from 'resend';

import { RESEND_EMAIL, RESEND_SENDER } from '../config';

const resend = new Resend(process.env.RESEND_KEY);

export const sendEmail = async ({ to, subject, text }: { to: string[]; subject: string; text: string }) => {
    const { error } = await resend.emails.send({
        from: `${RESEND_SENDER} <${RESEND_EMAIL}>`,
        to,
        subject,
        text,
    });

    if (error) {
        return { success: false, error: `Failed to send email: ${error.message}` };
    }

    return { success: true };
};
