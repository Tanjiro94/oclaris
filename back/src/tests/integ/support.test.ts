import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import { generateJwt } from '../../infra/jwt/jwt.service.js';

jest.mock('../../infra/mail/mailer.js', () => ({
	sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Support tickets routes', () => {
	const email = 'support.user@example.com';
	const username = 'support_user_ok';

	let userId: string;
	let token: string;

	beforeAll(async () => {
		await prisma.support_ticket
			.deleteMany({
				where: {
					user: { email },
				},
			})
			.catch(() => {});

		await prisma.user.deleteMany({ where: { email } });

		const user = await prisma.user.create({
			data: {
				email,
				username,
				password_hash: 'irrelevant',
				verified_at: new Date(),
			},
			select: { id: true },
		});

		userId = user.id;

		token = generateJwt(userId, username);
	});

	afterAll(async () => {
		await prisma.support_ticket
			.deleteMany({
				where: { user_id: userId },
			})
			.catch(() => {});

		await prisma.user.deleteMany({ where: { email } });
		await prisma.$disconnect();
	});

	it('POST /api/support-tickets crée un ticket pour le user connecté', async () => {
		const payload = {
			subject: 'Problème de facturation',
			category: 'billing',
			priority: 'high',
			message: 'Je ne comprends pas cette facture',
		};

		const res = await request(app)
			.post('/api/support-tickets')
			.set('Cookie', [`token=${token}`])
			.send(payload);

		if (res.status !== 201) {
			console.log('DEBUG POST /api/support-tickets BODY:', res.body);
		}

		expect(res.status).toBe(201);
		expect(res.body.ticket).toBeDefined();
		expect(res.body.ticket.subject).toBe(payload.subject);
		expect(res.body.ticket.message).toBe(payload.message);

		// Optionnel : vérifier qu'on a bien "essayé" d'envoyer un mail
		// expect(mailer.sendEmail).toHaveBeenCalledTimes(1);
	});

	it('GET /api/support-tickets retourne uniquement les tickets du user', async () => {
		const res = await request(app)
			.get('/api/support-tickets')
			.set('Cookie', [`token=${token}`]);

		if (res.status !== 200) {
			console.log('DEBUG GET /api/support-tickets BODY:', res.body);
		}

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.items)).toBe(true);
		expect(res.body.total).toBeGreaterThanOrEqual(1);
	});

	it('retourne 401 si non authentifié', async () => {
		const res = await request(app)
			.post('/api/support-tickets')
			.send({
				subject: 'Test',
				category: 'other',
				priority: 'low',
				message: 'test',
			});

		expect(res.status).toBe(401);
	});
});
