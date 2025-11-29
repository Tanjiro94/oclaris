import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import { hash } from '../../infra/crypto/bcrypt.service.js';

describe('GET /api/auth/me', () => {
    const EMAIL = 'me.test@example.com';
    const USERNAME = 'me_tester';
    const PASSWORD = 'MeTestPwd123!';

    beforeAll(async () => {
        await prisma.user.deleteMany({ where: { email: EMAIL } });

        const passwordHash = await hash(PASSWORD);

        await prisma.user.create({
            data: {
                email: EMAIL,
                username: USERNAME,
                password_hash: passwordHash,
                verified_at: new Date(),
            },
        });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: EMAIL } });
        await prisma.$disconnect();
    });

    it('returns current user when cookie is valid', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: EMAIL,
                password: PASSWORD,
            })
            .expect(200);

        const cookies = loginRes.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies.length).toBeGreaterThan(0);

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookies)
            .expect(200);

        expect(res.body.data).toMatchObject({
            email: EMAIL,
            username: USERNAME,
        });
        expect(res.body.data.id).toBeDefined();
    });

    it('returns 401 without cookie', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});
