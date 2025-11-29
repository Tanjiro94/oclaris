import { sendEmail } from './mailer.js';

export async function sendPasswordResetEmail(to: string, code: string) {
const subject = 'Réinitialisation de votre mot de passe';
const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5;">
    <h2>Réinitialisation de votre mot de passe</h2>
    <p>Voici votre code de réinitialisation :</p>
    <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
    <p>Ce code est valable <strong>15 minutes</strong>.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
    </div>
`;

return sendEmail(to, subject, html);
}
