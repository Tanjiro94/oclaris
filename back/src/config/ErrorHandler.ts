import type { NextFunction, Request, Response } from 'express';
import AppError from '../core/errors/AppError.js';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next;

    console.log('[ERROR] ', err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
};