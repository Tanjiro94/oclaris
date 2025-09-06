import request from 'supertest';
import app from '../../config/app.js';

describe('POST /api/auth/logout', () => {
it('clears the token cookie', async () => {
    const res = await request(app)
    .post('/api/auth/logout')
    .set('Cookie', ['token=whatever'])
    .send();

    expect(res.status).toBe(200);

    const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;

    expect(Array.isArray(cookies)).toBe(true);
    expect(cookies!.some(c => /^token=;/.test(c))).toBe(true);

    expect(cookies!.some(c => /HttpOnly/i.test(c))).toBe(true);
    expect(cookies!.some(c => /Expires=/.test(c))).toBe(true);
});
});