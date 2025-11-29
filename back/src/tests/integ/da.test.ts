import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import { generateJwt } from '../../infra/jwt/jwt.service.js';

describe('GET /api/da (integration)', () => {
const email = 'da.user@example.com';
const username = 'da_user_ok';
let userId = '';

beforeAll(async () => {
    await prisma.favorite.deleteMany({
    where: { user: { email } },
    }).catch(() => {});
    await prisma.art_direction.deleteMany({
    where: { user: { email } },
    }).catch(() => {});
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

    await prisma.art_direction.createMany({
    data: [
        {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
        user_id: userId,
        title: 'DA intégration 1',
        brief: 'Brief 1',
        use_gear: false,
        status: 'draft',
        },
        {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
        user_id: userId,
        title: 'DA intégration 2',
        brief: 'Brief 2',
        use_gear: true,
        status: 'ready',
        },
    ],
    });
});

afterAll(async () => {
    await prisma.favorite.deleteMany({
    where: { user_id: userId },
    }).catch(() => {});
    await prisma.art_direction.deleteMany({
    where: { user_id: userId },
    }).catch(() => {});
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
});

test('returns 200 and a valid DA list when authenticated', async () => {
    const token = generateJwt(userId, username);

    const res = await request(app)
    .get('/api/da')
    .set('Cookie', [`token=${token}`])
    .send();

    if (res.status !== 200) {
    console.log('DEBUG BODY /api/da:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);

    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const first = res.body.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('brief');
    expect(first).toHaveProperty('status');
    expect(first).toHaveProperty('created_at');
    expect(first).toHaveProperty('updated_at');
});

test('returns 401 without cookie', async () => {
    const res = await request(app).get('/api/da').send();
    expect(res.status).toBe(401);
});
});
