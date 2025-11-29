import prisma from "../../../infra/db/prismaClient.js";
import AppError from "../../../core/errors/AppError.js";
import type {
    CreateSupportTicketDto,
    ListSupportTicketsQueryDto,
} from "../validator/support.js";
import { supportMailer } from "../../../infra/mail/supportMailer.js";
import type { Prisma } from "../../../../generated/prisma/client.js";

export async function createSupportTicket(
    userId: string,
    payload: CreateSupportTicketDto,
) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError("Utilisateur introuvable", 404);
    }

    const ticket = await prisma.support_ticket.create({
        data: {
            user_id: userId,
            subject: payload.subject,
            category: payload.category,
            priority: payload.priority,
            message: payload.message,
            status: "open",
        },
    });

    await supportMailer.sendNewTicketToSupport(ticket, user);
    await supportMailer.sendTicketConfirmationToUser(ticket, user);

    return ticket;
}

export async function listSupportTicketsForUser(
    userId: string,
    query: ListSupportTicketsQueryDto = {},
) {
    const where: Prisma.support_ticketWhereInput = {
        user_id: userId,
    };

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.priority) where.priority = query.priority;

    const [data, total] = await Promise.all([
        prisma.support_ticket.findMany({
            where,
            orderBy: { created_at: "desc" },
        }),
        prisma.support_ticket.count({ where }),
    ]);

    return { data, total };
}
