import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string(),
    DATABASE_URL_TEST: z.string(),
    JWT_SECRET: z.string(),
    CORS_ORIGIN: z.string(),
    PORT: z.string(),
    REDIS_URL: z.string(),
    BCRYPT_SALT: z.number(),
    ENVIRONMENT: z.string(),
    RESEND_API_KEY: z.string(),
    APP_URL: z.string(),
    API_URL: z.string(),
    MAIL_FROM: z.string(),
});


const envRaw = {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    PORT: process.env.PORT,
    REDIS_URL: process.env.REDIS_URL,
    BCRYPT_SALT: parseInt(process.env.BCRYPT_SALT || '10'),
    ENVIRONMENT: process.env.ENVIRONMENT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
    MAIL_FROM: process.env.MAIL_FROM,
};

export const env = envSchema.parse(envRaw);