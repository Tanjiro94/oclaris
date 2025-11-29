import prisma from '../../../infra/db/prismaClient.js';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '../../../infra/mail/resetPasswordMailer.js';

const RESET_CODE_EXP_MINUTES = 15;

type StatusError = Error & { status?: number };

function createCodeError(message = 'Code invalide ou expiré', status = 400): StatusError {
    const err = new Error(message) as StatusError;
    err.status = status;
    return err;
}

function generateResetCode(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}


export async function createPasswordResetToken(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return;
    }

    const code = generateResetCode();
    const expiresAt = new Date(Date.now() + RESET_CODE_EXP_MINUTES * 60 * 1000);

    await prisma.password_reset_token.updateMany({
        where: {
        user_id: user.id,
        used_at: null,
        },
        data: {
        used_at: new Date(),
        },
    });

    await prisma.password_reset_token.create({
        data: {
        user_id: user.id,
        code,
        expires_at: expiresAt,
        },
    });

    await sendPasswordResetEmail(email, code);
    console.log('[PWD RESET] Code envoyé pour', email, '=>', code);
}

async function findValidToken(userId: string, code: string) {
return prisma.password_reset_token.findFirst({
    where: {
    user_id: userId,
    code,
    used_at: null,
    expires_at: { gt: new Date() },
    },
    orderBy: {
    created_at: 'desc',
    },
});
}

export async function verifyPasswordResetCode(email: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw createCodeError();
    }

    const token = await findValidToken(user.id, code);

    if (!token) {
        throw createCodeError();
    }
}


export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw createCodeError();
    }

    const token = await findValidToken(user.id, code);

    if (!token) {
        throw createCodeError();
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: passwordHash,
                updated_at: new Date(),
            },
        }),
        prisma.password_reset_token.update({
            where: { id: token.id },
            data: {
                used_at: new Date(),
            },
        }),
    ]);
}
