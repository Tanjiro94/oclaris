import type { Request, Response } from 'express';
import { env } from '../../config/env.js';

export const setCookie = (res: Response, name: string, value: string) => {
    res.cookie(name, value, {
        httpOnly: true,
        secure: env.ENVIRONMENT === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        sameSite: 'strict',
    });
};

export const getCookie = (req: Request, name: string) => {
    return req.cookies[name];
};

export const clearCookie = (res: Response, name: string) => {
    res.clearCookie(name, {
        httpOnly: true,
        secure: env.ENVIRONMENT === 'production',
        sameSite: 'strict',
    });
}