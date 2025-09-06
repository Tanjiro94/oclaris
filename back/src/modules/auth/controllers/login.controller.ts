import type { NextFunction, Request, Response } from 'express';
import { loginService } from '../services/login.service.js';
import { parseLoginInput } from '../validator/login.schema.js';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = parseLoginInput(req.body);
        const { user, token } = await loginService(email, password, res);
        res.status(200).json({ message: 'Login successful', data: { user, token } });
    } catch (error) {
        next(error);
    }
};