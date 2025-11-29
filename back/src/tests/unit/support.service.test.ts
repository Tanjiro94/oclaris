import { createSupportTicket, listSupportTicketsForUser } from '../../modules/support/service/support.service.js';
import type { CreateSupportTicketDto, ListSupportTicketsQueryDto } from '../../modules/support/validator/support.js';
import prisma from '../../infra/db/prismaClient.js';
import { supportMailer } from '../../infra/mail/supportMailer.js';

jest.mock('../../infra/db/prismaClient.js', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
        },
        support_ticket: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    },
}));

jest.mock('../../infra/mail/supportMailer.js', () => ({
    __esModule: true,
    supportMailer: {
        sendNewTicketToSupport: jest.fn(),
        sendTicketConfirmationToUser: jest.fn(),
    },
}));


const mockedPrisma = prisma as unknown as {
    user: {
        findUnique: jest.Mock;
    };
    support_ticket: {
        create: jest.Mock;
        findMany: jest.Mock;
        count: jest.Mock;
    };
};

const mockedMailer = supportMailer as unknown as {
    sendNewTicketToSupport: jest.Mock;
    sendTicketConfirmationToUser: jest.Mock;
};

describe('support.service - createSupportTicket', () => {
    const userId = 'user-uuid-1';

    const payload: CreateSupportTicketDto = {
        subject: 'Problème de facturation',
        category: 'billing',
        priority: 'high',
        message: 'Je ne comprends pas ma facture.',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('crée un ticket et envoie les deux mails', async () => {
        const fakeUser = {
            id: userId,
            email: 'test@example.com',
            username: 'testuser',
            password_hash: 'hash',
            created_at: new Date(),
            updated_at: new Date(),
            verified_at: null,
            verification_token_hash: null,
            verification_expires_at: null,
        };

        const fakeTicket = {
            id: 'ticket-uuid-1',
            user_id: userId,
            subject: payload.subject,
            category: payload.category,
            priority: payload.priority,
            message: payload.message,
            status: 'open',
            created_at: new Date(),
            updated_at: new Date(),
            closed_at: null,
        };

        mockedPrisma.user.findUnique.mockResolvedValue(fakeUser);
        mockedPrisma.support_ticket.create.mockResolvedValue(fakeTicket);

        const result = await createSupportTicket(userId, payload);

        // Prisma
        expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: userId },
        });
        expect(mockedPrisma.support_ticket.create).toHaveBeenCalledWith({
            data: {
                user_id: userId,
                subject: payload.subject,
                category: payload.category,
                priority: payload.priority,
                message: payload.message,
                status: 'open',
            },
        });

        // mails
        expect(mockedMailer.sendNewTicketToSupport).toHaveBeenCalledWith(
            fakeTicket,
            fakeUser,
        );
        expect(mockedMailer.sendTicketConfirmationToUser).toHaveBeenCalledWith(
            fakeTicket,
            fakeUser,
        );

        // retour
        expect(result).toEqual(fakeTicket);
    });

    it("lève une erreur si l'utilisateur n'existe pas", async () => {
        mockedPrisma.user.findUnique.mockResolvedValue(null);

        await expect(createSupportTicket(userId, payload)).rejects.toThrow(
            'Utilisateur introuvable',
        );

        expect(mockedPrisma.support_ticket.create).not.toHaveBeenCalled();
        expect(mockedMailer.sendNewTicketToSupport).not.toHaveBeenCalled();
    });
});

describe('support.service - listSupportTicketsForUser', () => {
    const userId = 'user-uuid-2';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('retourne les tickets filtrés par user et applique les filtres optionnels', async () => {
        const query: ListSupportTicketsQueryDto = {
            status: 'open',
            category: 'bug',
            priority: 'high',
        };

        const tickets = [
            {
                id: 'ticket-uuid-1',
                user_id: userId,
                subject: 'Bug 1',
                category: 'bug',
                priority: 'high',
                message: 'Un bug',
                status: 'open',
                created_at: new Date(),
                updated_at: new Date(),
                closed_at: null,
            },
        ];

        mockedPrisma.support_ticket.findMany.mockResolvedValue(tickets);
        mockedPrisma.support_ticket.count.mockResolvedValue(1);

        const { data, total } = await listSupportTicketsForUser(userId, query);

        expect(mockedPrisma.support_ticket.findMany).toHaveBeenCalledWith({
            where: {
                user_id: userId,
                status: 'open',
                category: 'bug',
                priority: 'high',
            },
            orderBy: { created_at: 'desc' },
        });

        expect(mockedPrisma.support_ticket.count).toHaveBeenCalledWith({
            where: {
                user_id: userId,
                status: 'open',
                category: 'bug',
                priority: 'high',
            },
        });

        expect(data).toEqual(tickets);
        expect(total).toBe(1);
    });
});
