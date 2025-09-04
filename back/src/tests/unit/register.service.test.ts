import { registerService } from '../../modules/auth/services/register.service.js';
import prisma from '../../infra/db/prismaClient.js';
import * as hash from '../../infra/crypto/bcrypt.service.js';

jest.mock('../../modules/auth/services/verification-token.service.js', () => ({
    createVerificationToken: jest.fn().mockResolvedValue('dummy-token'),
    invalidateVerificationToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../infra/mail/mailer.js', () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
}));


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

test('should throw if email already exists', async () => {
    jest.spyOn(prisma.user, 'findUnique')
    .mockResolvedValueOnce({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'test@test.com', username: 'test', password_hash: 'password', verified_at: null, created_at: new Date(), updated_at: new Date(), verification_token_hash: null, verification_expires_at: null } as MockUser);
    await expect(registerService({
        email: 'test@test.com',
        password: 'password',
        passwordConfirm: 'password',
        username: 'test',
    })).rejects.toThrow('Email already exists');
});


test('should throw if username already exists', async () => {
    jest.spyOn(prisma.user, 'findUnique')
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'test2@test.com', username: 'test2', password_hash: 'password', verified_at: null, created_at: new Date(), updated_at: new Date(), verification_token_hash: null, verification_expires_at: null } as MockUser);
    await expect(registerService({
        email: 'test2@test.com',
        password: 'password',
        passwordConfirm: 'password',
        username: 'test2',
    })).rejects.toThrow('Username already exists');
});

test('should create a user if all is good', async () => {
    jest.spyOn(prisma.user, 'findUnique')
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null);
    
    const createdAt = new Date('2025-01-01T00:00:00.000Z');

    jest.spyOn(prisma.user, 'create').mockResolvedValueOnce({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        email: 'test3@test.com',
        password_hash: 'password3',
        username: 'test3',
        verified_at: null,
        created_at: createdAt,
        updated_at: new Date(),
        verification_token_hash: null,
        verification_expires_at: null,
    } as MockUser);

    const hashSpy = jest.spyOn(hash, 'hash').mockResolvedValue('hashedPassword');

    const result = await registerService({
        email: 'test3@test.com',
        username: 'test3',
        password: 'password3',
        passwordConfirm: 'password3',
    });
    
    expect(hashSpy).toHaveBeenCalledWith('password3');
    expect(result).toEqual({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        email: 'test3@test.com',
        username: 'test3',
        createdAt: createdAt,
    });
});
