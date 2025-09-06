<template>
    <div class="dashboard-page">
        <h1>Dashboard</h1>
        <Button text="Se déconnecter" typeClass="primary" type="button" @click="logout" />
    </div>
</template>
<script setup lang="ts">
import Button from '@/components/UiButton.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
const authStore = useAuthStore();

const router = useRouter();

const logout = async () => {
    await authStore.logout();
    router.push('/');
}
</script>
<style scoped>

</style>