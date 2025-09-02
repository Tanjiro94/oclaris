<template>
    <div class="login-page">
        <div class="logo-mobile-wrapper">
        <img src="../../public/assets/logo-black.svg" alt="logo" class="logo-mobile-fixed">
        </div>
        <div class="left-side container">
            <img src="../../public/assets/logo-black.svg" alt="logo">
        </div>
        <div class="right-side">
            <div class="content">
                <div class="text-container">
                    <h1>Hey, content de te revoir !</h1>
                    <p>Deviens le maître dans l’organisation de tes shooting photos</p>
                </div>
                <form class="form-container" @submit.prevent="login">
                    <div class="form-group">
                    <Input label="Email" type="email" placeholder="Email" size="lg" v-model="email" name="email" id="email" />
                    </div>
                    <div class="form-group">
                    <Input label="Mot de passe" type="password" placeholder="Mot de passe" size="lg" v-model="password" name="password" id="password" />
                    </div>
                    <p><a href="/forgot-password" class="forgot-password-link">Mot de passe oublié ?</a></p>
                    <Button text="Se connecter" typeClass="primary" type="submit" />
                </form>
                <p>Pas de compte ? <a href="/register" class="register-link">Inscris toi maintenant !</a></p>
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
const message = ref('');
const error = ref(false);
const success = ref(false);

async function login() {
    if(!email.value || !password.value) {
        message.value = 'Veuillez remplir tous les champs';
        error.value = true;
        return;
    }
    console.log(email.value, password.value);
    success.value = true;
    message.value = 'Connexion réussie';
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
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
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
    .logo-mobile-wrapper{
        display: block;
    }
    .left-side {
        display: none;
    }
    .right-side {
        width: 100%;
        background-image: linear-gradient(to right top, #cb93f1, #bf86f1, #b179f1, #a16df2, #8f62f3);
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