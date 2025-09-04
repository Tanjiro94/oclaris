import { PrismaClient } from '../../../generated/prisma/client.js';
import { env } from '../../config/env.js';

const dbUrl = env.ENVIRONMENT === 'test' ? env.DATABASE_URL_TEST : env.DATABASE_URL;

const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
});

export default prisma;