import type { NextFunction, Request, Response } from 'express';
import AppError from '../core/errors/AppError.js';
import { getCookie } from '../infra/cookie/cookie.service.js';
import { verifyJwt } from '../infra/jwt/jwt.service.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
try {
    const token = getCookie(req, 'token');
    if (!token) throw new AppError('Non autorisé', 401);

    const payload = verifyJwt(token);
    req.user = { id: payload.userId, username: payload.username };

    next();
} catch {
    next(new AppError('Non autorisé', 401));
}
}