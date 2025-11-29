import { z } from 'zod';

export const requestPasswordResetSchema = z.object({
    email: z.string().email({ message: 'Email invalide' }),
});

export const verifyPasswordResetCodeSchema = z.object({
    email: z.string().email('Email invalide'),
    code: z.string().min(6).max(6),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
    code: z.string().min(6).max(6),
    password: z
        .string()
        .min(12, 'Le mot de passe doit contenir au moins 12 caractères'),
    passwordConfirm: z.string(),
    }).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Les mots de passe ne correspondent pas',
});

export type RequestPasswordResetDto = z.infer<typeof requestPasswordResetSchema>;
export type VerifyPasswordResetCodeDto = z.infer<typeof verifyPasswordResetCodeSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
