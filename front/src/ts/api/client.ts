import axios from 'axios';
import { useMessageStore } from '@/stores/message';
import type { apiErrors } from './apiErrors';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

api.interceptors.response.use(
    r => r,
    (err) => {
        const data = (err?.response?.data ?? {}) as Partial<apiErrors>;
        const normalized: apiErrors = {
        message: typeof data.message === 'string' ? data.message : 'Erreur réseau',
        code: data.code,
        errors: data.errors ?? undefined,
    };
        try {
            const store = useMessageStore();
            
            store.error(normalized.message);
        } catch {
            console.error('Store not ready');
        }
        if(err.response) err.response.data = normalized;
        return Promise.reject(err);
    }
)

