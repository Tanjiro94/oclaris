import type { Request, Response, NextFunction } from "express";
import AppError from "../../../core/errors/AppError.js";
import { createSupportTicketSchema, listSupportTicketsQuerySchema } from "../validator/support.js";
import { createSupportTicket as createSupportTicketService, listSupportTicketsForUser } from "../service/support.service.js";

export async function createSupportTicket(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Non autorisé", 401);

        const body = createSupportTicketSchema.parse(req.body);

        const ticket = await createSupportTicketService(userId, body);

        res.status(201).json({ ticket });
    } catch (e) {
        next(e);
    }
}

export async function listMySupportTickets(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Non autorisé", 401);

        const query = listSupportTicketsQuerySchema.parse(req.query);

        const { data, total } = await listSupportTicketsForUser(userId, query);

        res.json({ items: data, total });
    } catch (e) {
        next(e);
    }
}
