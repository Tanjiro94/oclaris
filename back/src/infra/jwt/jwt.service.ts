import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export type JwtPayload = {
    userId: string;
    username: string;
};


export const generateJwt = (userId: string, username: string) => {
    return jwt.sign({ userId, username }, env.JWT_SECRET, { expiresIn: '1h' });
};

export const verifyJwt = (token: string) => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};