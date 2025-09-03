<template>
    <div class="register-page">
        <div class="logo-mobile-wrapper">
        <img src="../../public/assets/logo-black.svg" alt="logo" class="logo-mobile-fixed">
        </div>
        <div class="left-side container">
            <img src="../../public/assets/logo-black.svg" alt="logo">
        </div>
        <div class="right-side">
            <div class="content">
                <div class="text-container">
                    <h1>Hey, le nouveau !</h1>
                    <p>Deviens le maître dans l’organisation de tes shooting photos</p>
                </div>
                <form class="form-container" @submit.prevent="register">
                    <div class="form-group">
                    <Input label="Email" type="email" placeholder="Email" size="lg" v-model="email" name="email" id="email" />
                    </div>
                    <div class="form-group">
                    <Input label="Nom d'utilisateur" type="text" placeholder="Nom d'utilisateur" size="lg" v-model="username" name="username" id="username" />
                    </div>
                    <div class="form-group">
                    <Input label="Mot de passe" type="password" placeholder="Mot de passe" size="lg" v-model="password" name="password" id="password" />
                    </div>
                    <div class="form-group">
                    <Input label="Confirmation du mot de passe" type="password" placeholder="Confirmation du mot de passe" size="lg" v-model="passwordConfirm" name="passwordConfirm" id="passwordConfirm" />
                    </div>
                    <Button text="S'inscrire" typeClass="primary" type="submit" />
                </form>
                <p>Déjà un compte ? <a href="/login" class="register-link">Connecte-toi maintenant !</a></p>
            </div>
        </div>
        <Message type="error" :message="message" v-if="message" :isOpen="error" @update:isOpen="error = $event" />
        <Message type="success" :message="message" v-if="message" :isOpen="success" @update:isOpen="success = $event" />
    </div>
</template>

<script lang="ts" setup>
import Input from '@/components/UiInput.vue';
import Button from '@/components/UiButton.vue';
import { ref } from 'vue';
import Message from '@/components/UiMessage.vue';

const email = ref('');
const password = ref('');
const username = ref('');
const passwordConfirm = ref('');
const message = ref('');
const error = ref(false);
const success = ref(false);

async function register() {
    if(!email.value || !password.value || !username.value || !passwordConfirm.value) {
        message.value = 'Veuillez remplir tous les champs';
        error.value = true;
        return;
    }
    const payload = {
        email: email.value,
        password: password.value,
        username: username.value,
        passwordConfirm: passwordConfirm.value,
    }
    console.log(payload);
    success.value = true;
    message.value = 'Inscription réussie';
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

.register-link {
    color: var(--primary-hover);
    text-decoration: underline;
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

@media (max-width: 400px) {
    .right-side .content .text-container p {
        width: 100%;
    }
}

</style>