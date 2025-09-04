import { Resend } from 'resend';
import { env } from '../../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);
const from = env.MAIL_FROM || 'onboarding@resend.dev';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
    });
    if(result.error) {
        throw new Error(result.error.message);
    }
    return result;
}