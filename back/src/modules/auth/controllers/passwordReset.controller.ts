import type { Request, Response, NextFunction } from 'express';
import { requestPasswordResetSchema, verifyPasswordResetCodeSchema, resetPasswordSchema } from '../validator/passwordReset.js';
import { createPasswordResetToken, verifyPasswordResetCode, resetPassword } from '../services/passwordReset.service.js';

export async function requestPasswordResetController( req: Request, res: Response, next: NextFunction ) {
    try {
        const { email } = requestPasswordResetSchema.parse(req.body);
        await createPasswordResetToken(email);

        res.status(200).json({ message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.',});
    } catch (err) {
        next(err);
    }
}

export async function verifyPasswordResetCodeController( req: Request, res: Response, next: NextFunction) {
    try {
        const { email, code } = verifyPasswordResetCodeSchema.parse(req.body);

        await verifyPasswordResetCode(email, code);

        res.status(200).json({ message: 'Code valide.' });
    } catch (err) {
        next(err);
    }
}

export async function resetPasswordController( req: Request, res: Response, next: NextFunction ) {
    try {
        const { email, code, password } = resetPasswordSchema.parse(req.body);

        await resetPassword(email, code, password);

        res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (err) {
        next(err);
    }
}
