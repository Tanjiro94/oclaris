import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';

export function hash(plain: string) {
    return bcrypt.hash(plain, env.BCRYPT_SALT);
}

export function compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
}