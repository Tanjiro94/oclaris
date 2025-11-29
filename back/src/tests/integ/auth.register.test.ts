import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import * as mailer from '../../infra/mail/mailer.js';

const EMAIL = 'register.test.user@example.com';
const USERNAME = 'register_test_user';

jest.mock('../../infra/mail/mailer.js', () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
}));

beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
});

test('POST /auth/register should register a user', async () => {
    const response = await request(app).post('/api/auth/register').send({
        email: EMAIL,
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        username: USERNAME,
    });

    if (response.status !== 201) {
        console.log('DEBUG BODY:', response.body);
    }
    expect(response.status).toBe(201);

    expect(response.body.data.email).toBe(EMAIL);
    expect(response.body.data.username).toBe(USERNAME);

    const inDb = await prisma.user.findUnique({
        where: { email: EMAIL },
    });
    expect(inDb).not.toBeNull();
    expect(inDb?.username).toBe(USERNAME);
    expect(mailer.sendEmail).toHaveBeenCalledTimes(1);
});

afterAll(async () => {
    await prisma.$disconnect();
});