import type { NextFunction, Response } from 'express';
import type { Request } from 'express';
import prisma from '../../../infra/db/prismaClient.js';
import AppError from '../../../core/errors/AppError.js';

export async function meController(req: Request, res: Response, next: NextFunction) {
try {
    const userId = req.user?.id;
    if (!userId) {
    throw new AppError('Non autorisé', 401);
    }

    const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
    });

    if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
    }

    return res.status(200).json({ data: user });
} catch (err) {
    next(err);
}
}