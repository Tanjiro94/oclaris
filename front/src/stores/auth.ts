import { defineStore } from 'pinia';
import { me, type MeResponse, logout } from '@/ts/api/auth';
import type { AxiosError } from 'axios';

type User = { id: string; username: string; email: string } | null;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User,
        hydrated: false,
    }),
getters: {
    isAuthenticated: (s) => !!s.user,
},
actions: {
    setUser(user: NonNullable<User>) {
    this.user = user;
    },
    clear() {
    this.user = null;
    },
    async hydrate() {
    try {
        const r: MeResponse = await me({ silent: true });
        this.user = r.data;
    } catch (error: unknown) {
        const axiosErr = error as AxiosError;
        if(axiosErr?.response?.status === 401) {
            this.user = null;
        }
    } finally {
        this.hydrated = true;
    }
    },
    async logout() {
        try {
            await logout();
        } finally {
            this.clear();
        }
    },
},
});