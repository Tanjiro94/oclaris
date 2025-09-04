import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';

beforeEach(async () => {
    await prisma.user.deleteMany({ where: {email: 'salahdinbenaouda@gmail.com'}});
});

test('POST /auth/register should register a user', async () => {
    const response = await request(app).post('/api/auth/register').send({
        email: 'salahdinbenaouda@gmail.com',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        username: 'salahdinbenaouda',
    });

    if (response.status !== 201) {
        console.log('DEBUG BODY:', response.body);
    }
    expect(response.status).toBe(201);

    expect(response.body.data.email).toBe('salahdinbenaouda@gmail.com');
    expect(response.body.data.username).toBe('salahdinbenaouda');

    const inDb = await prisma.user.findUnique({
        where: { email: 'salahdinbenaouda@gmail.com' },
    });
    expect(inDb).not.toBeNull();
    expect(inDb?.username).toBe('salahdinbenaouda');
});


afterAll(async () => {
    await prisma.$disconnect();
});