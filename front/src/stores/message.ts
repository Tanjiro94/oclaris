import { defineStore } from 'pinia';

type MessageType = 'success' | 'error';

export const useMessageStore = defineStore('message', {
    state: () => ({
    isOpen: false as boolean,
    type: 'success' as MessageType,
    message: '' as string,
    timeoutId: null as ReturnType<typeof setTimeout> | null,
    duration: 4000 as number, // ms
    }),
    actions: {
    open(type: MessageType, message: string, duration?: number) {
        this.type = type;
        this.message = message;
        this.isOpen = true;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        const d = duration ?? this.duration;
        this.timeoutId = setTimeout(() => this.close(), d);
    },
    success(msg: string, duration?: number) {
        this.open('success', msg, duration);
    },
    error(msg: string, duration?: number) {
        this.open('error', msg, duration);
    },
    close() {
        this.isOpen = false;
        if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        }
    },
    },
});