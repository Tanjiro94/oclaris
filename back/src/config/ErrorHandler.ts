import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import AppError from '../core/errors/AppError.js';

type errorBody = {
    message: string;
    code?: string;
    errors?: Record<string, string>;
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next;

    console.log('[ERROR] ', err);

    if (!(err instanceof AppError && err.statusCode === 401)) {
        console.log('[ERROR] ', err);
    }

    if(err instanceof ZodError) {
        const fieldErrors : Record<string, string> = {};
        for (const issue of err.issues) {
            const key = String(issue.path[0] ?? 'form');
            if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        const body: errorBody = { message: 'Validation failed', errors: fieldErrors };
        return res.status(422).json(body);
    }

    if (err instanceof AppError) {
        const body : errorBody = { message: err.message }
        if(err.code) body.code = err.code;
        if(err.errors) body.errors = err.errors;
        return res.status(err.statusCode).json(body);
    }
    return res.status(500).json({ message: 'Internal server error' } satisfies errorBody);
};