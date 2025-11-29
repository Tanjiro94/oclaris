import {
    createSupportTicketSchema,
    listSupportTicketsQuerySchema,
} from '../../modules/support/validator/support.js';

describe('createSupportTicketSchema', () => {
    it('accepte un payload valide', () => {
        const input = {
            subject: 'Problème de facturation',
            category: 'billing',
            priority: 'high',
            message: 'Je ne comprends pas ma dernière facture.',
        };

        const parsed = createSupportTicketSchema.parse(input);

        expect(parsed.subject).toBe(input.subject);
        expect(parsed.category).toBe('billing');
        expect(parsed.priority).toBe('high');
        expect(parsed.message).toBe(input.message);
    });

    it('requiert une priority valide', () => {
        const input = {
            subject: 'Un bug',
            category: 'bug',
            priority: 'medium',
            message: 'Mon écran est noir',
        };
    
        const parsed = createSupportTicketSchema.parse(input);
    
        expect(parsed.priority).toBe('medium');
    });

    it('rejette si subject est vide', () => {
        const input = {
            subject: '',
            category: 'bug',
            priority: 'low',
            message: 'Y a un souci',
        };

        expect(() => createSupportTicketSchema.parse(input)).toThrow();
    });

    it('rejette une catégorie invalide', () => {
        const input = {
            subject: 'Test',
            category: 'invalid',
            priority: 'low',
            message: 'bla',
        };

        expect(() => createSupportTicketSchema.parse(input)).toThrow();
    });
});

describe('listSupportTicketsQuerySchema', () => {
    it('accepte un query vide', () => {
        const parsed = listSupportTicketsQuerySchema.parse({});
        expect(parsed).toEqual({});
    });

    it('accepte un filtre par status / category / priority', () => {
        const query = {
            status: 'open',
            category: 'bug',
            priority: 'high',
        };

        const parsed = listSupportTicketsQuerySchema.parse(query);

        expect(parsed.status).toBe('open');
        expect(parsed.category).toBe('bug');
        expect(parsed.priority).toBe('high');
    });

    it('rejette un status invalide', () => {
        const query = {
            status: 'invalid',
        };

        expect(() => listSupportTicketsQuerySchema.parse(query)).toThrow();
    });
});
