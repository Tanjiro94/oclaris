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
];

const emailRules = [
    {
        regex: /@/,
        message: 'Email invalide',
    },
]

export const registerSchema = z.object({
    email: z.string().refine((email: string) =>{
        return emailRules.every((rule) => rule.regex.test(email));
    }, {
        message: emailRules.map((rule) => rule.message).join(', '),
        path: ['email'],
    }),
    password: z.string().min(12, { message: 'Mot de passe trop court' }).refine((password: string) => {
        return passwordRules.every((rule) => rule.regex.test(password));
    }, {
        message: passwordRules.map((rule) => rule.message).join(', '),
        path: ['password'],
    }),
    username: z.string().min(6, { message: 'Nom d\'utilisateur trop court' }),
    passwordConfirm: z.string().min(12, { message: 'Mot de passe trop court' }),
}).refine((data: { password: string; passwordConfirm: string }) => data.password === data.passwordConfirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['passwordConfirm'],
});

export type RegisterForm = z.infer<typeof registerSchema>;
