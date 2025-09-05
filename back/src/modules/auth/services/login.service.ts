import prisma from '../../../infra/db/prismaClient.js';
import { compare } from '../../../infra/crypto/bcrypt.service.js';
import { generateJwt } from '../../../infra/jwt/jwt.service.js';
import AppError from '../../../core/errors/AppError.js';
import { setCookie } from '../../../infra/cookie/cookie.service.js';
import type { Response } from 'express';

export async function loginService(email: string, password: string, res: Response) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, password_hash: true, username: true, email: true, verified_at: true },
    });
    if (!user) {
        throw new AppError('Utilisateur non trouvé', 404);
    }
    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new AppError('Mot de passe incorrect', 401);
    }

    const isUserVerified = user.verified_at;
    if (!isUserVerified) {
        throw new AppError('Utilisateur non vérifié', 401);
    }
    const token = generateJwt(user.id, user.username);
    setCookie(res, 'token', token);
    return { 
        user : {
            id: user.id,
            username: user.username,
            email: user.email,
        },
        token : token,
    };
}