import { z } from 'zod';

const passwordRules = [
    {
        regex: /[A-Z]/,
        message: 'Mot de passe doit contenir au moins une lettre majuscule',
    },
    {
        regex: /[0-9]/,
        message: 'Mot de passe doit contenir au moins un chiffre',
    },
    {
        regex: /[!@#$%^&*()]/,
        message: 'Mot de passe doit contenir au moins un caractère spécial',
    },
]

const emailRules = [
    {
        regex: /@/,
        message: 'Email invalide',
    },
]

export const registerSchema = z.object({
    email: z.string().refine((email) => {
        return emailRules.every((rule) => rule.regex.test(email));
    }, {
        message: emailRules.map((rule) => rule.message).join(', '),
        path: ['email'],
    }),
    password: z.string().min(12, { message: 'Mot de passe trop court' }).refine((password) => {
        return passwordRules.every((rule) => rule.regex.test(password));
    }, {
        message: passwordRules.map((rule) => rule.message).join(', '),
        path: ['password'],
    }),
    passwordConfirm: z.string().min(12, { message: 'Mot de passe trop court' }),
    username: z.string().min(6, { message: 'Nom d\'utilisateur trop court' }),
}).refine((data) => data.password === data.passwordConfirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirm'],
});

export const parseRegisterInput = (input: unknown) => {
    return registerSchema.parse(input);
};

export type RegisterSchema = z.infer<typeof registerSchema>;