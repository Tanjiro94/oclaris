import { z } from 'zod';

export const ticketCategorySchema = z.enum([
    'bug',
    'billing',
    'question',
    'other',
]);

export const ticketPrioritySchema = z.enum([
    'low',
    'medium',
    'high',
    'urgent',
]);

export const ticketStatusSchema = z.enum([
    'open',
    'in_progress',
    'resolved',
    'closed',
]);

export const createSupportTicketSchema = z.object({
    subject: z.string().min(1, 'L’objet est obligatoire').max(120),
    category: ticketCategorySchema,
    priority: ticketPrioritySchema,
    message: z.string().min(1, 'Le message est obligatoire'),
});

export const listSupportTicketsQuerySchema = z.object({
status: ticketStatusSchema.optional(),
category: ticketCategorySchema.optional(),
priority: ticketPrioritySchema.optional(),
});

export const supportTicketListItemSchema = z.object({
    id: z.string().uuid(),
    subject: z.string(),
    category: ticketCategorySchema,
    priority: ticketPrioritySchema,
    status: ticketStatusSchema,
    created_at: z.date().or(z.string()),
    updated_at: z.date().or(z.string()),
});

export const listSupportTicketsResponseSchema = z.object({
    data: z.array(supportTicketListItemSchema),
    total: z.number(),
});

export type CreateSupportTicketDto = z.infer<typeof createSupportTicketSchema>;
export type ListSupportTicketsQueryDto = z.infer<typeof listSupportTicketsQuerySchema>;
export type SupportTicketListItemDto = z.infer<typeof supportTicketListItemSchema>;
export type ListSupportTicketsResponseDto = z.infer<typeof listSupportTicketsResponseSchema>;
