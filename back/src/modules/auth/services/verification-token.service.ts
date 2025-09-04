import crypto from 'crypto';
import prisma from '../../../infra/db/prismaClient.js';
import { hash, compare } from '../../../infra/crypto/bcrypt.service.js';


export async function invalidateVerificationToken(userId: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { verification_token_hash: null, verification_expires_at: null },
    });
}

export async function createVerificationToken(userId: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await hash(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await prisma.user.update({
        where: { id: userId },
        data: { verification_token_hash: tokenHash, verification_expires_at: expiresAt },
    });
    return {token, expiresAt};
}
    

export async function consumeVerificationToken(email: string, token: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, verification_expires_at: true, verification_token_hash: true },
    });
    if (!user || !user.verification_token_hash || !user.verification_expires_at) return null;
    if(user.verification_expires_at < new Date()) return null;

    const ok = await compare(token, user.verification_token_hash);
    if(!ok) return null;

    await prisma.user.update({
        where: { id: user.id },
        data: { verification_token_hash: null, verification_expires_at: null, verified_at: new Date(), updated_at: new Date() },
    });
    return user.id;
}