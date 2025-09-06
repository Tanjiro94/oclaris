import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: 'Email invalide' }),
    password: z.string().min(1, { message: 'Mot de passe requis' }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
