import type { NextFunction, Request, Response } from 'express';
import { clearCookie } from '../../../infra/cookie/cookie.service.js';

export const logoutController = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        clearCookie(res, 'token');
        res.status(200).json({ message: 'Logged out' });
    } catch (err) {
        next(err);
    }
};