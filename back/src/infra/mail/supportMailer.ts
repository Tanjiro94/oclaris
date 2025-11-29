import type { support_ticket as SupportTicket, user as User } from '../../../generated/prisma/client.js';
import { sendEmail } from './mailer.js';

const SUPPORT_EMAIL = 'salahdinbenaouda@gmail.com';

function formatTicketSubject(ticket: SupportTicket) {
    return `[Support Oclaris] #${ticket.id.slice(0, 8)} - ${ticket.subject}`;
}

export const supportMailer = {
    async sendNewTicketToSupport(ticket: SupportTicket, user: User) {
    const subject = formatTicketSubject(ticket);

    const html = `
        <p>Nouveau ticket support créé :</p>
        <ul>
        <li><strong>Utilisateur :</strong> ${user.email} (${user.username})</li>
        <li><strong>ID :</strong> ${ticket.id}</li>
        <li><strong>Catégorie :</strong> ${ticket.category}</li>
        <li><strong>Priorité :</strong> ${ticket.priority}</li>
        <li><strong>Statut :</strong> ${ticket.status}</li>
        <li><strong>Créé le :</strong> ${ticket.created_at.toISOString()}</li>
        </ul>
        <p><strong>Message :</strong></p>
        <pre>${ticket.message}</pre>
    `;

    await sendEmail(SUPPORT_EMAIL, subject, html);
    },

    async sendTicketConfirmationToUser(ticket: SupportTicket, user: User) {
    const subject = `Votre ticket a bien été créé (#${ticket.id.slice(0, 8)})`;

    const html = `
        <p>Bonjour ${user.username},</p>
        <p>Nous avons bien reçu votre demande de support :</p>
        <ul>
        <li><strong>Objet :</strong> ${ticket.subject}</li>
        <li><strong>Catégorie :</strong> ${ticket.category}</li>
        <li><strong>Priorité :</strong> ${ticket.priority}</li>
        </ul>
        <p>Message :</p>
        <pre>${ticket.message}</pre>
        <p>Nous reviendrons vers vous dès que possible.</p>
    `;

    await sendEmail(user.email, subject, html);
    },
};
