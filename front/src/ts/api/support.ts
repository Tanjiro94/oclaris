import { api } from './client.js';
import { createSupportTicketSchema, listSupportTicketsQuerySchema, listSupportTicketsResponseSchema, type CreateSupportTicketDto,type ListSupportTicketsQueryDto, type ListSupportTicketsResponseDto } from './validator/support.js';

export async function createSupportTicket(payload: CreateSupportTicketDto): Promise<void> {
    const data = createSupportTicketSchema.parse(payload);

    await api.post('/support-tickets', data);
}

export async function listSupportTickets(query: ListSupportTicketsQueryDto = {}): Promise<ListSupportTicketsResponseDto> {
    const safeQuery = listSupportTicketsQuerySchema.parse(query);

    const res = await api.get('/support-tickets', {
        params: safeQuery,
    });

    return listSupportTicketsResponseSchema.parse(res.data);
}
