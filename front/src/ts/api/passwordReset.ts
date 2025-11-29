import { api } from './client';
import type { RequestPasswordResetInput, VerifyPasswordResetCodeInput, ConfirmPasswordResetInput } from './validator/passwordReset';

export async function requestPasswordReset(payload: RequestPasswordResetInput) {
const { data } = await api.post('/auth/password-reset/request', payload);
return data;
}

export async function verifyPasswordResetCode(payload: VerifyPasswordResetCodeInput) {
const { data } = await api.post('/auth/password-reset/verify', payload);
return data;
}

export async function confirmPasswordReset(payload: ConfirmPasswordResetInput) {
const { data } = await api.post('/auth/password-reset/confirm', {
    email: payload.email,
    code: payload.code,
    password: payload.password,
    passwordConfirm: payload.passwordConfirm,
});
return data;
}
