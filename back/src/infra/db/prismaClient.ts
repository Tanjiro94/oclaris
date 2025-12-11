import { PrismaClient } from '../../../generated/prisma/client.js';
import { env } from '../../config/env.js';

let dbUrl;

if(env.ENVIRONMENT === 'test') {
    dbUrl = env.DATABASE_URL_TEST;
} else if(env.ENVIRONMENT === 'dev') {
    dbUrl = env.DATABASE_URL;
} else if(env.ENVIRONMENT === 'prod') {
    dbUrl = env.DATABASE_URL_PROD;
} else if(env.ENVIRONMENT === 'staging') {
    dbUrl = env.DATABASE_URL_STAGING;
}

if(!dbUrl) {
    throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
});

export default prisma;