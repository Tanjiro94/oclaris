<template>
    <div class="account-page container">
        <div class="container-row row">
            <div class="left-container col col-xl-3 col-md-3 col-sm-3 col-xs-3">
                <div class="left-container-content">
                    <div class="links-account-wrapper">
                        <div class="link-account-item">
                            <button class="link-account-button active" ref="informationsPersonnellesButton" @click="onClickedLink('informations-personnelles')">
                                Informations personnelles
                            </button>
                            <button class="link-account-button" ref="mesFavorisButton" @click="onClickedLink('mes-favoris')">
                                Mes favoris
                            </button>
                            <button class="link-account-button" ref="historiqueDesGenerationsButton" @click="onClickedLink('historique-des-generations')">
                                Historique des générations
                            </button>
                            <button class="link-account-button" ref="supportButton" @click="onClickedLink('support')">
                                Support
                            </button>
                        </div>
                        <div class="link-account-item">
                            <button class="link-account-button logout-button" @click="onClickedLogout()">
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-container col col-xl-9 col-md-9 col-sm-9 col-xs-9">
                <div class="right-container-content">
                    <PersonnalData v-if="activeLink === 'informations-personnelles'" :user="user" />
                    <Favorite v-if="activeLink === 'mes-favoris'" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { logout } from '@/ts/api/auth';
import { useRouter } from 'vue-router';
import PersonnalData from '@/components/Account/PersonnalData.vue';
import { useAuthStore } from '@/stores/auth';
import Favorite from '@/components/Account/FavoriteView.vue';
const router = useRouter();
const activeLink = ref('informations-personnelles');
const authStore = useAuthStore();
const user = computed(() => authStore.user as { id: string; email: string; username: string; createdAt: string; updatedAt: string; });
const informationsPersonnellesButton = ref<HTMLButtonElement | null>(null);
const mesFavorisButton = ref<HTMLButtonElement | null>(null);
const historiqueDesGenerationsButton = ref<HTMLButtonElement | null>(null);
const supportButton = ref<HTMLButtonElement | null>(null);

onMounted(() => {
    informationsPersonnellesButton.value?.classList.add('active');
    mesFavorisButton.value?.classList.remove('active');
    historiqueDesGenerationsButton.value?.classList.remove('active');
    supportButton.value?.classList.remove('active');
});

function onClickedLink(link: string) {
    activeLink.value = link;
    informationsPersonnellesButton.value?.classList.remove('active');
    mesFavorisButton.value?.classList.remove('active');
    historiqueDesGenerationsButton.value?.classList.remove('active');
    supportButton.value?.classList.remove('active');
    if (link === 'informations-personnelles') {
        informationsPersonnellesButton.value?.classList.add('active');
    } else if (link === 'mes-favoris') {
        mesFavorisButton.value?.classList.add('active');
    } else if (link === 'historique-des-generations') {
        historiqueDesGenerationsButton.value?.classList.add('active');
    } else if (link === 'support') {
        supportButton.value?.classList.add('active');
    }
}

function onClickedLogout() {
    logout();
    router.push('/login');
}
</script>

<style scoped>

.account-page .left-container .left-container-content{
    background-color: var(--primary-grey);
    border-radius: var(--border-radius);
    padding: var(--spacing-l);
    height: 85vh;
}
.left-container-content .links-account-wrapper{
    height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: var(--spacing-s);
}
.left-container-content .links-account-wrapper .link-account-item{
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
}
.left-container-content .links-account-wrapper .link-account-item .link-account-button{
    width: 100%;
    padding: var(--spacing-m) var(--spacing-m);
    border-radius: var(--border-radius);
    border: none;
    cursor: pointer;
    transition: all 0.6s ease-in-out;
    background-color: var(--secondary-grey);
    color: var(--beige-color);
}
.left-container-content .links-account-wrapper .link-account-item .link-account-button:hover{
    background-color: var(--secondary-grey-hover);
}
.left-container-content .links-account-wrapper .link-account-item .link-account-button.active{
    background-color: var(--primary-color);
    color: var(--black-color);
}
.left-container-content .links-account-wrapper .link-account-item .link-account-button.active:hover{
    background-color: var(--primary-hover);
}
.left-container-content .links-account-wrapper .link-account-item .link-account-button.logout-button:hover{
    background-color: var(--secondary-grey-hover);
}

.account-page .right-container{
    background-color: var(--secondary-grey);
}
.account-page .right-container .right-container-content{
    background-color: var(--primary-grey);
    border-radius: var(--border-radius);
    padding: var(--spacing-l);
    height: 85vh;
}
</style>