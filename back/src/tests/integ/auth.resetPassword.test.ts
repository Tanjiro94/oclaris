import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import { resetDb } from '../utils/testDb.js';
import bcrypt from 'bcryptjs';

describe('Password reset routes', () => {
const email = 'integ@example.com';
const username = 'integ_user';
const password = 'OldPass123123!';

beforeAll(async () => {
    process.env.ENVIRONMENT = 'test';
    await resetDb();
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    await resetDb();
    const password_hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
    data: {
        email,
        username,
        password_hash,
    },
    });
});

test('flow complet: request -> verify -> confirm', async () => {
    const resRequest = await request(app)
    .post('/api/auth/password-reset/request')
    .send({ email })
    .expect(200);

    expect(resRequest.body.message).toBeDefined();

    const user = await prisma.user.findUnique({ where: { email } });
    const token = await prisma.password_reset_token.findFirst({
    where: { user_id: user!.id },
    orderBy: { created_at: 'desc' },
    });

    expect(token).not.toBeNull();

    const resVerify = await request(app)
    .post('/api/auth/password-reset/verify')
    .send({ email, code: token!.code })
    .expect(200);

    expect(resVerify.body.message).toBe('Code valide.');

    const newPassword = 'NewPass456456!';

    const resConfirm = await request(app)
    .post('/api/auth/password-reset/confirm')
    .send({
        email,
        code: token!.code,
        password: newPassword,
        passwordConfirm: newPassword,
    })
    .expect(200);

    expect(resConfirm.body.message).toBe(
    'Mot de passe mis à jour avec succès.',
    );

    const userAfter = await prisma.user.findUnique({ where: { email } });
    const ok = await bcrypt.compare(
    newPassword,
    userAfter!.password_hash,
    );
    expect(ok).toBe(true);
});

test("request ne leak pas si l'email n'existe pas", async () => {
    const res = await request(app)
    .post('/api/auth/password-reset/request')
    .send({ email: 'unknown@example.com' })
    .expect(200);

    expect(res.body.message).toBeDefined();
    const tokens = await prisma.password_reset_token.findMany();
    expect(tokens).toHaveLength(0);
});
});
