<template>
    <div class="login-page">
        <div class="logo-mobile-wrapper">
        <img src="/assets/logo-black.svg" alt="logo" class="logo-mobile-fixed">
        </div>
        <div class="left-side container">
            <img src="/assets/logo-black.svg" alt="logo">
        </div>
        <div class="right-side">
            <div class="content">
                <div class="text-container">
                    <h1>Hey, content de te revoir !</h1>
                    <p>Deviens le maître dans l’organisation de tes shooting photos</p>
                </div>
                <form class="form-container" @submit.prevent="onSubmit">
                    <div class="form-group">
                    <Input label="Email" type="email" placeholder="Email" size="lg" v-model="form.email" name="email" id="email" />
                    </div>
                    <div class="form-group">
                    <Input label="Mot de passe" type="password" placeholder="Mot de passe" size="lg" v-model="form.password" name="password" id="password" />
                    </div>
                    <p><a href="/forgot-password" class="forgot-password-link">Mot de passe oublié ?</a></p>
                    <Button text="Se connecter" typeClass="primary" type="submit" :loading="loading" />
                </form>
                <p>Pas de compte ? <a href="/register" class="register-link">Inscris toi maintenant !</a></p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Input from '@/components/UiInput.vue';
import Button from '@/components/UiButton.vue';
import { ref, reactive } from 'vue';
import { useMessageStore } from '@/stores/message';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { loginSchema, type LoginSchema } from '@/ts/api/validator/login';
import type { AxiosError } from 'axios';
import type { apiErrors } from '@/ts/api/apiErrors';
import { login } from '@/ts/api/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive<LoginSchema>({
    email: '',
    password: '',
});

const errors = reactive<Record<string, string>>({});
const loading = ref(false);

const validate = () => {
    Object.keys(errors).forEach(k => delete errors[k]);
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
        for (const issue of parsed.error.issues) {
            const key = (issue.path[0] as string) ?? 'form';
            errors[key] = issue.message;
        }
        return false;
    }
    return true;
}


const onSubmit = async () => {
    if (!validate()) return;
    loading.value = true;
    const messageStore = useMessageStore();
    try {
        const {data } = await login(form);
        authStore.setUser(data.user);
        messageStore.success('Connexion réussie');
        router.push('/dashboard');
    }catch (error: unknown) {
        const axiosErr = error as AxiosError<apiErrors>;

        Object.keys(errors).forEach(k => delete errors[k]);
        if(axiosErr?.response?.data?.errors) {
            for (const [field, msg] of Object.entries(axiosErr.response.data.errors)) {
                errors[field] = msg;
            }
        } else if(axiosErr?.response?.data?.message) {
            messageStore.error(axiosErr.response.data.message);
        }
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.login-page {
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

.register-link {
    color: var(--primary-hover);
    text-decoration: underline;
}


@media (max-width: 768px) {
    .login-page {
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

@media (max-width: 400px) {
    .right-side .content .text-container p {
        width: 100%;
    }
}

</style>