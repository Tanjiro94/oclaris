import { api } from './client';

export type registerPayload = {
    email: string;
    password: string;
    username: string;
    passwordConfirm: string;
}


export type registerResponse = {
    message: string;
    data: {
        id: string;
        email: string;
        username: string;
        createdAt: Date;
    }
}

export async function register(payload: registerPayload) {
    const {data} = await api.post<registerResponse>('/auth/register', payload);
    return data;
}

export async function verifyEmail(params: { token: string, email: string }) {
    const {data} = await api.get('/auth/verify', { params });
    return data as { message: string };
}