import type { Request, Response } from 'express';
import { consumeVerificationToken } from '../services/verification-token.service.js';

export async function verifyEmailController(req: Request, res: Response) {
    const token = String(req.query.token || '');
    const email = String(req.query.email || '');
    if (!token || !email) {
    return res.redirect(`${process.env.APP_URL}/?verified=0`);
    }

    const userId = await consumeVerificationToken(email, token);
    if (!userId) {
    return res.redirect(`${process.env.APP_URL}/?verified=0`);
    }

    return res.redirect(`${process.env.APP_URL}/?verified=1`);
}