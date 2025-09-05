import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import { hash } from '../../infra/crypto/bcrypt.service.js';

const EMAIL = 'login.test.user@example.com';

beforeAll(async () => {
await prisma.user.deleteMany({ where: { email: EMAIL } });
});

afterEach(async () => {
await prisma.user.deleteMany({ where: { email: EMAIL } });
});

afterAll(async () => {
await prisma.$disconnect();
});

describe('POST /api/auth/login (integration)', () => {
test('returns 404 when user not found', async () => {
    const res = await request(app)
    .post('/api/auth/login')
    .send({ email: EMAIL, password: 'Whatever123!' });

    expect(res.status).toBe(404);
    expect(res.body?.message).toMatch(/Utilisateur non trouvé/i);
});

test('returns 401 when password is invalid', async () => {
    const passwordHash = await hash('CorrectPwd123!');
    await prisma.user.create({
    data: {
        email: EMAIL,
        username: 'login_tester',
        password_hash: passwordHash,
        verified_at: new Date(),
    },
    });

    const res = await request(app)
    .post('/api/auth/login')
    .send({ email: EMAIL, password: 'WrongPwd123!' });

    expect(res.status).toBe(401);
    expect(res.body?.message).toMatch(/Mot de passe incorrect/i);
});

test('returns 401 when user is not verified', async () => {
    const passwordHash = await hash('CorrectPwd123!');
    await prisma.user.create({
    data: {
        email: EMAIL,
        username: 'login_tester',
        password_hash: passwordHash,
        verified_at: null,
    },
    });
});

test('returns 200, sets cookie and returns user + token when credentials are valid', async () => {
    const passwordHash = await hash('CorrectPwd123!');
    await prisma.user.create({
    data: {
        email: EMAIL,
        username: 'login_tester_ok',
        password_hash: passwordHash,
        verified_at: new Date(),
    },
    });

    const res = await request(app)
    .post('/api/auth/login')
    .send({ email: EMAIL, password: 'CorrectPwd123!' });

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('token');
    expect(typeof res.body.data.token).toBe('string');

    expect(res.body.data.user).toMatchObject({
    email: EMAIL,
    username: 'login_tester_ok',
    });

    const setCookie = res.headers['set-cookie'];
    expect(Array.isArray(setCookie)).toBe(true);
    expect(setCookie[0]).toMatch(/token=/);
});
});