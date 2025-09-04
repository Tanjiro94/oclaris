import prisma from '../../../infra/db/prismaClient.js';
import type { RegisterSchema } from '../validator/register.schema.js';
import AppError from '../../../core/errors/AppError.js';
import { hash } from '../../../infra/crypto/bcrypt.service.js';
import { sendEmail } from '../../../infra/mail/mailer.js';
import { createVerificationToken, invalidateVerificationToken } from './verification-token.service.js';
import { env } from '../../../config/env.js';

export const registerService = async (data: RegisterSchema) => {
    const { email, password, username } = data;
    const emailExists = await prisma.user.findUnique({
        where: { email },
    });
    if (emailExists) {
        throw new AppError('Email already exists', 400);
    }
    const usernameExists = await prisma.user.findUnique({
        where: { username },
    });
    if (usernameExists) {
        throw new AppError('Username already exists', 400);
    }
    const hashedPassword = await hash(password);
    
    const user = await prisma.user.create({
        data: { email, password_hash: hashedPassword, username },
        select: { id: true, email: true, username: true, created_at: true },
    });

    await invalidateVerificationToken(user.id);
    const token = await createVerificationToken(user.id);
    const url = `${env.API_URL}/auth/verify?token=${token.token}&email=${encodeURIComponent(user.email)}`;

    await sendEmail(email, 'Verifier votre email', `Cliquez <a href="${url}">ici</a> pour vérifier votre email. Le lien expirera dans 24 heures.`);

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.created_at,
    };
};