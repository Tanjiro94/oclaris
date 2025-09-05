// login.service.test.ts

import { loginService } from '../../modules/auth/services/login.service.js';
import prisma from '../../infra/db/prismaClient.js';
import * as bcrypt from '../../infra/crypto/bcrypt.service.js';
import * as jwt from '../../infra/jwt/jwt.service.js';
import * as cookie from '../../infra/cookie/cookie.service.js';
import AppError from '../../core/errors/AppError.js';
import type { Response } from 'express';

afterEach(() => {
jest.clearAllMocks();
jest.resetAllMocks();
});

type MockUser = {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    verified_at: Date | null;
    created_at: Date;
    updated_at: Date;
    verification_token_hash: string | null;
    verification_expires_at: Date | null;
};

describe('loginService', () => {
test('throws 404 when user not found', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null as unknown as MockUser);

    await expect(
    loginService('unknown@mail.com', 'whatever', {} as Response)
    ).rejects.toEqual(new AppError('Utilisateur non trouvé', 404));

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
    where: { email: 'unknown@mail.com' },
    select: { id: true, password_hash: true, username: true, email: true, verified_at: true },
    });
});

test('throws 401 when user is not verified', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'test@mail.com',
    username: 'tester',
    password_hash: 'hashed_pwd',
    verified_at: null,
    } as MockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

    await expect(
    loginService('test@mail.com', 'whatever', {} as Response)
    ).rejects.toEqual(new AppError('Utilisateur non vérifié', 401));

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
    where: { email: 'test@mail.com' },
    select: { id: true, password_hash: true, username: true, email: true, verified_at: true },
    });
});

test('throws 401 when password is invalid', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'test@mail.com',
    username: 'tester',
    password_hash: 'hashed_pwd',
    verified_at: new Date(),
    } as MockUser);

    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

    await expect(
    loginService('test@mail.com', 'bad-password', {} as Response)
    ).rejects.toEqual(new AppError('Mot de passe incorrect', 401));

    expect(bcrypt.compare).toHaveBeenCalledWith('bad-password', 'hashed_pwd');
});

test('returns user + token and sets cookie when credentials are valid', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'ok@mail.com',
    username: 'okuser',
    password_hash: 'hashed_ok',
    verified_at: new Date(),
    } as MockUser);

    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
    jest.spyOn(jwt, 'generateJwt').mockReturnValue('jwt-123');
    const setCookieSpy = jest.spyOn(cookie, 'setCookie').mockImplementation(() => {});
    const resStub = {} as Response;

    const result = await loginService('ok@mail.com', 'correct-pass', resStub);

    expect(bcrypt.compare).toHaveBeenCalledWith('correct-pass', 'hashed_ok');
    expect(jwt.generateJwt).toHaveBeenCalledWith(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'okuser'
    );
    expect(setCookieSpy).toHaveBeenCalledWith(resStub, 'token', 'jwt-123');

    expect(result).toEqual({
    user: {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        username: 'okuser',
        email: 'ok@mail.com',
    },
    token: 'jwt-123',
    });
});
});