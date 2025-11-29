import { z } from 'zod';

const emailSchema = z
.string()
.trim()
.email("Adresse email invalide");

const codeSchema = z
.string()
.trim()
.length(6, "Le code doit contenir 6 caractères");

const passwordSchema = z
.string()
.min(12, "Le mot de passe doit contenir au moins 12 caractères")
.regex(/[A-Z]/, "Au moins une majuscule")
.regex(/[a-z]/, "Au moins une minuscule")
.regex(/[0-9]/, "Au moins un chiffre")
.regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial");

export const requestPasswordResetSchema = z.object({
email: emailSchema,
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const verifyPasswordResetCodeSchema = z.object({
email: emailSchema,
code: codeSchema,
});
export type VerifyPasswordResetCodeInput = z.infer<typeof verifyPasswordResetCodeSchema>;

export const confirmPasswordResetSchema = z
.object({
    email: emailSchema,
    code: codeSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
})
.refine((data) => data.password === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
});

export type ConfirmPasswordResetInput = z.infer<typeof confirmPasswordResetSchema>;
