import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);

export const sendEmail = async ({ to, subject, text }: { to: string[]; subject: string; text: string }) => {
    const { error } = await resend.emails.send({
        from: 'JKT48 Private Message <hello@fleetime.my.id>',
        to,
        subject,
        text,
    });

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
