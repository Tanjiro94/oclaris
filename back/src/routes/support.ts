import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { createSupportTicket, listMySupportTickets } from '../modules/support/controller/support.controller.js';

export const supportTicketRouter = Router();

supportTicketRouter.post('/support-tickets', requireAuth, createSupportTicket);

supportTicketRouter.get( '/support-tickets', requireAuth, listMySupportTickets,);
