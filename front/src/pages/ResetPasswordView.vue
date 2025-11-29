<template>
    <div
    class="register-page"
    :class="{ 'register-page--guest': isGuestMode }"
    >
    <div class="logo-mobile-wrapper">
        <img src="/assets/logo-black.svg" alt="logo" class="logo-mobile-fixed" />
    </div>

    <div class="left-side container">
        <img src="/assets/logo-black.svg" alt="logo" />
    </div>

    <div class="right-side">
        <div class="content">
        <div class="text-container">
            <h1>Réinitialiser ton mot de passe</h1>
            <p>On va sécuriser ton accès à Oclaris en quelques étapes.</p>
        </div>

        <div class="steps-container">
            <div v-for="s in steps" :key="s.id" class="step-item" :class="{ active: !success && displayStep === s.id, done: displayStep > s.id}">
                <div class="step-badge">
                    <span v-if="displayStep > s.id">✓</span>
                    <span v-else>{{ s.id }}</span>
                </div>
                <div class="step-texts">
                    <div class="step-title">{{ s.title }}</div>
                    <div class="step-caption">{{ s.caption }}</div>
                </div>
            </div>
        </div>

        <form
            class="form-container"
            @submit.prevent="onSubmit"
            v-if="!success"
        >
            <p v-if="serverErrors" class="error-message">
            {{ serverErrors }}
            </p>

            <template v-if="step === 1">
            <div class="form-group">
                <UiInput
                label="Email"
                type="email"
                placeholder="Email"
                size="lg"
                v-model="form.email"
                name="email"
                id="email"
                />
            </div>
            </template>

            <template v-else-if="step === 2">
            <div class="form-group">
                <UiInput label="Email" type="email" placeholder="Email" size="lg" v-model="form.email" name="email" id="email"/>
            </div>

            <div class="form-group">
                <UiInput label="Code de réinitialisation" type="text" placeholder="Code à 6 caractères" size="lg" v-model="form.code" name="code" id="code"/>
                <p class="hint-text"> Regarde dans ta boîte mail, tu as reçu un code de la part d’Oclaris.</p>
            </div>
            </template>

            <template v-else>
            <div class="form-group">
                <UiInput label="Email" type="email" placeholder="Email" size="lg" v-model="form.email" name="email" id="email"/>
            </div>

            <div class="form-group">
                <UiInput label="Code de réinitialisation" type="text" placeholder="Code à 6 caractères" size="lg" v-model="form.code" name="code" id="code"/>
            </div>

            <div class="form-group password-group">
                <UiInput label="Nouveau mot de passe" type="password" placeholder="Mot de passe" size="lg" v-model="form.password" name="password" id="password"/>
                <div class="rules-container">
                    <div v-for="i in 4" :key="i" class="rules-rect" :class="{ active: i <= passedCount }">
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
                <UiInput label="Confirmation du mot de passe" type="password" placeholder="Confirmation du mot de passe" size="lg" v-model="form.passwordConfirm" name="passwordConfirm" id="passwordConfirm"/>
            </div>
            </template>

            <div class="buttons-row">
                <UiButton v-if="step > 1" text="Retour" typeClass="secondary" type="button" :loading="false" :disabled="loading" @click="onBack"/>
                <UiButton :text="submitLabel" typeClass="primary" type="submit" :loading="loading" :disabled="isSubmitDisabled"/>
            </div>
        </form>

        <div v-else class="success-block">
            <h2>Mot de passe mis à jour !</h2>
            <p v-if="isLoggedIn">Ton mot de passe a été mis à jour, tu peux continuer à utiliser Oclaris.</p>
            <p v-else>Tu peux maintenant te reconnecter avec ton nouveau mot de passe.</p>

            <UiButton :text="isLoggedIn ? 'Retour à l’accueil' : 'Retour à la connexion'" typeClass="primary" type="button" :loading="false" :disabled="false" @click="isLoggedIn ? goToHome() : goToLogin()"/>
        </div>

        <p v-if="!success && isAuthReady">
            <template v-if="isLoggedIn">
                Tu veux revenir sur ton espace ?
                <a href="#" class="register-link" @click.prevent="goToPreviousPage">Retour en arrière</a>
            </template>

            <template v-else>
                Tu te souviens de ton mot de passe ?
                <a href="/" class="register-link" @click.prevent="goToLogin">Retour à la connexion</a>
            </template>
        </p>

        </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
import UiInput from '@/components/UiInput.vue';
import UiButton from '@/components/UiButton.vue';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessageStore } from '@/stores/message';
import { useAuthStore } from '@/stores/auth';
import type { AxiosError } from 'axios';
import { requestPasswordReset, verifyPasswordResetCode, confirmPasswordReset } from '@/ts/api/passwordReset';
import { requestPasswordResetSchema, verifyPasswordResetCodeSchema, confirmPasswordResetSchema } from '@/ts/api/validator/passwordReset';

type ApiErrorPayload = {
    message: string;
    code?: string;
    errors?: Record<string, string>;
};

const router = useRouter();
const messageStore = useMessageStore();
const authStore = useAuthStore();

const authReady = ref(false);
const isLoggedIn = ref(false);

const isAuthReady = computed(() => authReady.value);
const isGuestMode = computed(() => authReady.value && !isLoggedIn.value);

const goToPreviousPage = () => {
    router.back();
};

const step = ref<1 | 2 | 3>(1);
const steps = [
    { id: 1 as const, title: 'Email', titleShort: 'Email', caption: 'Envoi du code' },
    { id: 2 as const, title: 'Code', titleShort: 'Code', caption: 'Vérification' },
    {
    id: 3 as const,
    title: 'Nouveau mot de passe',
    titleShort: 'Mot de passe',
    caption: 'Sécurisation du compte',
    },
];

const form = reactive({
    email: '',
    code: '',
    password: '',
    passwordConfirm: '',
});

const errors = reactive<Record<string, string>>({});
const serverErrors = ref('');
const loading = ref(false);
const success = ref(false);

const hasTwelveChars = (p: string) => p.length >= 12;
const hasUppercase = (p: string) => /[A-Z]/.test(p);
const hasNumber = (p: string) => /\d/.test(p);
const hasSpecial = (p: string) => /[^A-Za-z0-9]/.test(p);

const checks = computed(() => {
    const p = form.password;
    return [hasTwelveChars(p), hasUppercase(p), hasNumber(p), hasSpecial(p)];
});

const passedCount = computed(() => checks.value.filter(Boolean).length);

const submitLabel = computed(() => {
    if (step.value === 1) return 'Envoyer le code';
    if (step.value === 2) return 'Vérifier le code';
    return 'Confirmer le nouveau mot de passe';
});

const isSubmitDisabled = computed(() => {
    if (loading.value) return true;
    if (step.value === 3 && passedCount.value !== 4) return true;
    return false;
});

function clearErrors() {
    Object.keys(errors).forEach((k) => delete errors[k]);
    serverErrors.value = '';
}

function validateStep(): boolean {
    clearErrors();

    let parsed:
    | ReturnType<typeof requestPasswordResetSchema.safeParse>
    | ReturnType<typeof verifyPasswordResetCodeSchema.safeParse>
    | ReturnType<typeof confirmPasswordResetSchema.safeParse>;

    if (step.value === 1) {
    parsed = requestPasswordResetSchema.safeParse({ email: form.email });
    } else if (step.value === 2) {
    parsed = verifyPasswordResetCodeSchema.safeParse({
        email: form.email,
        code: form.code,
    });
    } else {
    parsed = confirmPasswordResetSchema.safeParse({
        email: form.email,
        code: form.code,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
    });
    }

    if (!parsed.success) {
    for (const issue of parsed.error.issues) {
        const key = (issue.path[0] as string) ?? 'form';
        errors[key] = issue.message;
    }
    serverErrors.value = 'Certains champs sont invalides.';
    return false;
    }

    return true;
}

const onSubmit = async () => {
    if (!validateStep()) return;

    loading.value = true;
    serverErrors.value = '';

    try {
    if (step.value === 1) {
        const res = await requestPasswordReset({ email: form.email });
        messageStore.success(
        res?.message ||
            'Si un compte existe avec cet email, un code a été envoyé.'
        );
        step.value = 2;
    } else if (step.value === 2) {
        const res = await verifyPasswordResetCode({
        email: form.email,
        code: form.code,
        });
        messageStore.success(res?.message || 'Code valide.');
        step.value = 3;
    } else {
        const res = await confirmPasswordReset({
        email: form.email,
        code: form.code,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        });
        messageStore.success(
        res?.message || 'Mot de passe mis à jour avec succès.'
        );
        success.value = true;
    }
    } catch (error: unknown) {
    const axiosErr = error as AxiosError<ApiErrorPayload>;
    const payload = axiosErr.response?.data;

    clearErrors();

    if (payload?.errors) {
        for (const [field, msg] of Object.entries(payload.errors)) {
        errors[field] = msg as string;
        }
        serverErrors.value = payload.message || 'Une erreur est survenue.';
    } else if (payload?.message) {
        serverErrors.value = payload.message;
        messageStore.error(payload.message);
    } else {
        serverErrors.value = 'Une erreur est survenue.';
        messageStore.error('Une erreur est survenue');
    }
    } finally {
    loading.value = false;
    }
};

const displayStep = computed(() => {
    return success.value ? 4 : step.value;
});

const onBack = () => {
    if (step.value > 1 && !success.value) {
    step.value = (step.value - 1) as 1 | 2 | 3;
    clearErrors();
    }
};

onMounted(async () => {
    try {
        if (!authStore.hydrated) {
        await authStore.hydrate();
        }
        isLoggedIn.value = authStore.isAuthenticated;
    } finally {
        authReady.value = true;
    }
});

const goToHome = () => {
    router.push('/dashboard');
};

const goToLogin = () => {
    router.push('/');
};
</script>

<style scoped>
.register-page {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 100dvh;
}

.logo-mobile-wrapper {
    display: none;
    padding: var(--spacing-m);
}

.logo-mobile-fixed {
    width: calc(150 / 16 * 1rem);
}

.left-side {
    height: 100%;
    width: 50%;
    padding-top: var(--spacing-l);
    background-image: linear-gradient(
    to right top,
    #cb93f1,
    #bf86f1,
    #b179f1,
    #a16df2,
    #8f62f3
    );
}

.left-side img {
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

.rules-rect.active .inner-rect {
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

.steps-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
    margin-bottom: var(--spacing-l);
}

.step-item {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-s);
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-s);
    border-radius: var(--border-radius);
    background-color: var(--secondary-grey);
    opacity: 0.7;
    transition: background-color 0.2s ease, opacity 0.2s ease,
    transform 0.15s ease;
}

.step-item.active {
    background-color: var(--primary-grey);
    opacity: 1;
    transform: translateX(2px);
}

.step-item.done {
    background-color: rgba(46, 204, 113, 0.15);
    opacity: 1;
}

.step-badge {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 1px solid var(--primary-grey);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--small-font-size);
    font-weight: 600;
    background-color: var(--secondary-grey);
}

.step-item.active .step-badge {
    border-color: var(--primary-color);
}

.step-item.done .step-badge {
    background-color: #2ecc71;
    border-color: #2ecc71;
    color: #02160a;
}

.step-texts {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.step-title {
    font-size: var(--small-font-size);
    font-weight: 600;
}

.step-caption {
    font-size: 0.75rem;
    opacity: 0.7;
}

.buttons-row {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-s);
    align-items: center;
}

.hint-text {
    font-size: var(--small-font-size);
    opacity: 0.7;
    margin-top: var(--spacing-xs);
}

.success-block {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    margin-bottom: var(--spacing-l);
}

@media (max-width: 768px) {
    .register-page {
    min-height: 100dvh;
    height: auto;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    background-image: linear-gradient(
        to right top,
        #cb93f1,
        #bf86f1,
        #b179f1,
        #a16df2,
        #8f62f3
    );
    }
    .logo-mobile-wrapper {
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
