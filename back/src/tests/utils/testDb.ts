import prisma from '../../infra/db/prismaClient.js';

export async function resetDb() {
await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
    password_reset_token,
    support_ticket,
    generation_job,
    favorite,
    gear,
    art_direction,
    "user"
    RESTART IDENTITY CASCADE;
`);
}
