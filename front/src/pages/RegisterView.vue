<template>
    <div class="register-page">
        <div class="logo-mobile-wrapper">
        <img src="/assets/logo-black.svg" alt="logo" class="logo-mobile-fixed">
        </div>
        <div class="left-side container">
            <img src="/assets/logo-black.svg" alt="logo">
        </div>
        <div class="right-side">
            <div class="content">
                <div class="text-container">
                    <h1>Hey, le nouveau !</h1>
                    <p>Deviens le maître dans l’organisation de tes shooting photos</p>
                </div>
                <form class="form-container" @submit.prevent="onSubmit">
                    <div class="form-group">
                    <Input label="Email" type="email" placeholder="Email" size="lg" v-model="form.email" name="email" id="email" />
                    </div>
                    <div class="form-group">
                    <Input label="Nom d'utilisateur" type="text" placeholder="Nom d'utilisateur" size="lg" v-model="form.username" name="username" id="username" />
                    </div>
                    <div class="form-group password-group">
                    <Input label="Mot de passe" type="password" placeholder="Mot de passe" size="lg" v-model="form.password" name="password" id="password" />
                    <div class="rules-container">
                        <div
                        v-for="i in 4"
                        :key="i"
                        class="rules-rect"
                        :class="{ active: i <= passedCount }"
                        >
                        <div class="inner-rect"></div>
                        </div>
                    </div>
                    <ul class="rules-list">
                        <li class="rules-list-item" :class="{ active: checks[0] }">12 caractères</li>
                        <li class="rules-list-item" :class="{ active: checks[1] }">1 majuscule</li>
                        <li class="rules-list-item" :class="{ active: checks[2] }">1 chiffre</li>
                        <li class="rules-list-item" :class="{ active: checks[3] }">1 caractère spécial</li>
                    </ul>
                    </div>
                    <div class="form-group">
                    <Input label="Confirmation du mot de passe" type="password" placeholder="Confirmation du mot de passe" size="lg" v-model="form.passwordConfirm" name="passwordConfirm" id="passwordConfirm" />
                    </div>
                    <Button text="S'inscrire" typeClass="primary" type="submit" :loading="loading" :disabled="passedCount !== 4" />
                </form>
                <p>Déjà un compte ? <a href="/login" class="register-link">Connecte-toi maintenant !</a></p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Input from '@/components/UiInput.vue';
import Button from '@/components/UiButton.vue';
import { ref, reactive, computed } from 'vue';
import { register } from '@/ts/api/auth';
import { registerSchema, type RegisterForm } from '@/ts/api/validator/register';
import { useMessageStore } from '@/stores/message';
import type { AxiosError } from 'axios';

const form = reactive<RegisterForm>({
    email: '',
    password: '',
    username: '',
    passwordConfirm: '',
});

type ApiErrorPayload = {
    message: string;
    code?: string;
    errors?: Record<string,string>;
}

const errors = reactive<Record<string, string>>({});
const serverErrors = ref('')
const success = ref(false);
const loading = ref(false);

const validate = () => {
    Object.keys(errors).forEach(key => {
        delete errors[key];
        serverErrors.value = '';
    });
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
        for (const issue of parsed.error.issues) {
        const key = (issue.path[0] as string) ?? 'form';
        errors[key] = issue.message;
        }
        return false;
    }
    return true;
}


// rules of register
const hasTwelveChars = (p: string) => p.length >= 12;
const hasUppercase   = (p: string) => /[A-Z]/.test(p);
const hasNumber      = (p: string) => /\d/.test(p);
const hasSpecial     = (p: string) => /[!@#$%^&*()]/.test(p);

const checks = computed(() => {
    const p = form.password;
    return [
        hasTwelveChars(p),
        hasUppercase(p),
        hasNumber(p),
        hasSpecial(p),
    ];
});

const passedCount = computed(() => checks.value.filter(Boolean).length);

const onSubmit = async () => {
    if (!validate()) return;
    loading.value = true;
    serverErrors.value = '';
    success.value = false;
    const messageStore = useMessageStore();
    try {
        await register({
            email: form.email,
            password: form.password,
            username: form.username,
            passwordConfirm: form.passwordConfirm,
        })
        success.value = true;
        messageStore.success('Inscription réussie, check ton email pour activer ton compte');
    } catch (error: unknown) {
        const axiosErr = error as AxiosError<ApiErrorPayload>;
        const payload = axiosErr.response?.data;

        Object.keys(errors).forEach(k => delete errors[k]);

        if (payload?.errors) {
            for (const [field, msg] of Object.entries(payload.errors)) {
            errors[field] = msg as string;
            }
        } else if (payload?.message) {
            useMessageStore().error(payload.message);
        } else {
            useMessageStore().error('Une erreur est survenue');
        }
    } finally {
        loading.value = false;
    }
}

</script>

<style scoped>
.register-page {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 100dvh;
}

.logo-mobile-wrapper{
    display: none;
    padding: var(--spacing-m);
}

.logo-mobile-fixed{
    width: calc(150 / 16 * 1rem);
}

.left-side {
    height: 100%;
    width: 50%;
    padding-top: var(--spacing-l);
    background-image: linear-gradient(to right top, #cb93f1, #bf86f1, #b179f1, #a16df2, #8f62f3);
}

.left-side img{
    width: calc(150 / 16 * 1rem);
}

.right-side {
    width: 50%;
    height: 100%;
    padding: var(--spacing-l);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.text-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    margin-bottom: var(--spacing-l);
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-l);
    margin-bottom: var(--spacing-l);
}

.form-group.password-group .input-container {
    margin-bottom: var(--spacing-s);
}

.form-group .rules-container {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-xs);
}

.rules-rect {
    width: 32px;
    height: 8px;
    background-color: var(--primary-grey);
    border-radius: var(--border-radius);
    position: relative;
    overflow: hidden;
    margin-bottom: var(--spacing-xs);
}

.rules-rect .inner-rect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    background-color: var(--primary-color);
    transition: left 0.3s ease-in-out;
}

.rules-rect.active .inner-rect{
    left: 0;
    background-color: var(--primary-color);
}

.rules-list {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-xs);
}

.rules-list-item {
    color: var(--beige-color);
    font-size: var(--small-font-size);
    opacity: 0.5;
}
.rules-list-item.active {
    opacity: 1;
}

.register-link {
    color: var(--primary-hover);
    text-decoration: underline;
}

.error-message {
    color: var(--accent-color);
}


@media (max-width: 768px) {
    .register-page {
        min-height: 100dvh;
        height: auto;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        background-image: linear-gradient(to right top, #cb93f1, #bf86f1, #b179f1, #a16df2, #8f62f3);
    }
    .logo-mobile-wrapper{
        display: block;
    }
    .left-side {
        display: none;
    }
    .right-side {
        width: 100%;
        padding: var(--spacing-m);
    }
    .right-side .content {
        padding: var(--spacing-m);
        background-color: var(--secondary-grey);
        border-radius: var(--border-radius);
    }
    .right-side .content .text-container p {
        width: 80%;
    }
}

@media (max-width: 576px) {
    .rules-list {
        flex-direction: column;
    }
}

@media (max-width: 400px) {
    .right-side .content .text-container p {
        width: 100%;
    }
}

</style>