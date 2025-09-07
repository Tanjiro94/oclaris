import request from 'supertest';
import app from '../../config/app.js';
import prisma from '../../infra/db/prismaClient.js';
import { generateJwt } from '../../infra/jwt/jwt.service.js';

describe('GET /api/dashboard (integration)', () => {
const email = 'dash.user@example.com';
const username = 'dash_user_ok';
let userId = '';

beforeAll(async () => {
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
});

afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
});

test('returns 200 and a valid dashboard payload when authenticated', async () => {
    const token = generateJwt(userId, username);
    const res = await request(app)
    .get('/api/dashboard')
    .set('Cookie', [`token=${token}`])
    .send();

    if (res.status !== 200) {
    
    console.log('DEBUG BODY:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Dashboard data');
    expect(res.body).toHaveProperty('dashboard');

    const d = res.body.dashboard;
    
    expect(typeof d.successRate30d).toBe('number');
    expect(typeof d.satisfactionRate30d).toBe('number');
    expect(typeof d.favorites30d).toBe('number');
    expect(typeof d.generations30d).toBe('number');

    expect(Array.isArray(d.stylesTop5)).toBe(true);
    expect(Array.isArray(d.latest4)).toBe(true);

    expect(d).toHaveProperty('activity');
    expect(Array.isArray(d.activity.days)).toBe(true);
    expect(Array.isArray(d.activity.generations)).toBe(true);
    expect(Array.isArray(d.activity.favorites)).toBe(true);
    expect(d.activity.days.length).toBe(7);
    expect(d.activity.generations.length).toBe(7);
    expect(d.activity.favorites.length).toBe(7);
    expect(d.activity).toHaveProperty('avg7d');
    expect(typeof d.activity.avg7d.generations).toBe('number');
    expect(typeof d.activity.avg7d.favorites).toBe('number');
});

test('returns 401 without cookie', async () => {
    const res = await request(app).get('/api/dashboard').send();
    expect(res.status).toBe(401);
});
});