import prisma from '../infra/db/prismaClient.js';
import { env } from '../config/env.js';

type infoRow = {
    db: string;
    schema: string;
}

async function main() {
    const [info] = await prisma.$queryRawUnsafe<infoRow[]>(`
        SELECT current_database() AS db, current_schema() AS schema
    `);

    const usersCount = await prisma.user.count();
    const sample = await prisma.user.findMany({
        select: { id: true, email: true },
        orderBy: { email: 'asc' },
    });

    console.log('Environment =', env.ENVIRONMENT);
    console.log('Database URL =', env.DATABASE_URL);
    console.log('Database URL Test =', env.DATABASE_URL_TEST);
    console.log('DB =', info.db, 'schema =', info.schema);
    console.log('usersCount =', usersCount);
    console.log('sample =', sample);
}

main().finally(() => prisma.$disconnect());
