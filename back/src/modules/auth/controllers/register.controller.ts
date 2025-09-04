import type { NextFunction, Request, Response } from 'express';
import { registerService } from '../services/register.service.js';
import { parseRegisterInput } from '../validator/register.schema.js';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, username } = parseRegisterInput(req.body);
        const user = await registerService({ email, password, username, passwordConfirm: password });
        res.status(201).json({ message: 'User created successfully', data: {
            createdAt: user.createdAt,
            email: user.email,
            username: user.username,
            id: user.id,
        } });
    } catch (error) {
        next(error);
    }
};