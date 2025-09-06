import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import { generateJwt } from '../../infra/jwt/jwt.service.js';

describe('GET /api/auth/me', () => {
const EMAIL = 'me.test@example.com';
const USERNAME = 'me_tester';

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    await prisma.user.create({
    data: {
        email: EMAIL,
        username: USERNAME,
        password_hash: 'irrelevant',
        verified_at: new Date(),
    },
    });
});

afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    await prisma.$disconnect();
});

it('returns current user when cookie is valid', async () => {
    const u = await prisma.user.findUnique({ where: { email: EMAIL } });
    const jwt = generateJwt(u!.id, u!.username);

    const res = await request(app)
    .get('/api/auth/me')
    .set('Cookie', [`token=${jwt}`])
    .expect(200);

    expect(res.body.data).toMatchObject({
    id: u!.id,
    email: EMAIL,
    username: USERNAME,
    });
});

it('returns 401 without cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
});
});