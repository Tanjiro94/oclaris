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

export type loginPayload = {
    email: string;
    password: string;
}

export type loginResponse = {
    message: string;
    data: {
        user: {
            id: string;
            email: string;
            username: string;
        };
        token: string;
    }
}

export type logoutResponse = {
    message: string;
}

export async function register(payload: registerPayload) {
    const {data} = await api.post<registerResponse>('/auth/register', payload);
    return data;
}

export async function verifyEmail(params: { token: string, email: string }) {
    const {data} = await api.get('/auth/verify', { params });
    return data as { message: string };
}

export async function login(payload: loginPayload) {
    const {data} = await api.post<loginResponse>('/auth/login', payload);
    return data;
}

export type MeResponse = {
    data: {
        id: string;
        email: string;
        username: string;
    }
}

export async function me(options?: { silent?: boolean }) {
    const headers = options?.silent ? { 'x-silent': 'true' } : undefined;
    const {data} = await api.get<MeResponse>('/auth/me', { headers });
    return data;
}

export async function logout() {
    const {data} = await api.post<logoutResponse>('/auth/logout');
    return data;
}