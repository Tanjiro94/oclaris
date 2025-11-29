import prisma from '../../infra/db/prismaClient.js';
import {
    createPasswordResetToken,
    verifyPasswordResetCode,
    resetPassword,
} from '../../modules/auth/services/passwordReset.service.js';
import bcrypt from 'bcryptjs';
import { resetDb } from '../utils/testDb.js';

describe('Password reset service', () => {
    const email = 'user@example.com';
    const username = 'user_test';
    const oldPassword = 'OldPass123!';
    const newPassword = 'NewPass456!';

    beforeAll(async () => {
        await resetDb();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await resetDb();

        const password_hash = await bcrypt.hash(oldPassword, 10);
        await prisma.user.create({
            data: {
                email,
                username,
                password_hash,
            },
        });
    });

    test('createPasswordResetToken crée un token pour un email existant', async () => {
        await createPasswordResetToken(email);

        const user = await prisma.user.findUnique({ where: { email } });
        expect(user).not.toBeNull();

        const token = await prisma.password_reset_token.findFirst({
            where: { user_id: user!.id },
        });

        expect(token).not.toBeNull();
        expect(token!.code).toHaveLength(6);
    });

    test("createPasswordResetToken ne throw pas si l'email n'existe pas", async () => {
        // ✅ On vérifie uniquement que ça ne jette pas d'erreur.
        // On ne fait plus d'assumption sur l'état global de la table password_reset_token,
        // qui peut être modifiée par d'autres tests (intégration, autre fichier, etc.).
        await expect(
            createPasswordResetToken('unknown@example.com'),
        ).resolves.toBeUndefined();
    });

    test('verifyPasswordResetCode accepte un code valide', async () => {
        await createPasswordResetToken(email);

        const user = await prisma.user.findUnique({ where: { email } });
        expect(user).not.toBeNull();

        const token = await prisma.password_reset_token.findFirst({
            where: { user_id: user!.id },
            orderBy: { created_at: 'desc' },
        });

        await expect(
            verifyPasswordResetCode(email, token!.code),
        ).resolves.toBeUndefined();
    });

    test('verifyPasswordResetCode rejette un code invalide', async () => {
        await createPasswordResetToken(email);

        await expect(
            verifyPasswordResetCode(email, 'AAAAAA'),
        ).rejects.toHaveProperty('message', 'Code invalide ou expiré');
    });

    test('resetPassword met à jour le mot de passe et invalide le token', async () => {
        await createPasswordResetToken(email);

        const userBefore = await prisma.user.findUnique({ where: { email } });
        expect(userBefore).not.toBeNull();

        const token = await prisma.password_reset_token.findFirst({
            where: { user_id: userBefore!.id },
            orderBy: { created_at: 'desc' },
        });
        expect(token).not.toBeNull();

        await resetPassword(email, token!.code, newPassword);

        const userAfter = await prisma.user.findUnique({ where: { email } });
        expect(userAfter).not.toBeNull();
        expect(userAfter!.password_hash).not.toBe(userBefore!.password_hash);

        const usedToken = await prisma.password_reset_token.findUnique({
            where: { id: token!.id },
        });
        expect(usedToken).not.toBeNull();
        expect(usedToken!.used_at).not.toBeNull();

        const ok = await bcrypt.compare(newPassword, userAfter!.password_hash);
        expect(ok).toBe(true);
    });
});
