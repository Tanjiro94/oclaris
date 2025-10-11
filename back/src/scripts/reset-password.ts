import 'dotenv/config';
import prisma from '../infra/db/prismaClient.js';
import { hash } from '../infra/crypto/bcrypt.service.js';

async function main() {
    const email = 'salahdinbenaouda@gmail.com';
    const newPlain = 'Meliodas941!';
    const hashedPassword = await hash(newPlain);
    const u = await prisma.user.update({
        where: { email },
        data: { password_hash: hashedPassword as string },
        select: { id: true, email: true, updated_at: true }
    });
    console.log('UPDATED:', u);
}
main().finally(() => prisma.$disconnect());
