<template>
    <header class="header container">
        <nav class="header-nav">
            <ul class="header-nav-list">
                
                <li class="logo" aria-label="logo">
                    <RouterLink to="/">
                    <img src="../../public/assets/logo.svg" alt="logo" />
                    </RouterLink>
                </li>
                <li class="logo-mobile" aria-label="menu">
                    <RouterLink to="/">
                    <img src="../../public/assets/logo-mobile.svg" alt="menu" />
                    </RouterLink>
                </li>
            </ul>
            <ul class="nav-links">
                <li :class="{ 'active': $route.path === '/dashboard' }">
                    <RouterLink to="/dashboard">
                        <i class="fa-solid fa-gauge"></i>
                        <span>Dashboard</span>
                    </RouterLink>
                </li>
                <li :class="{ 'active': $route.path === '/create-da' }">
                    <RouterLink to="/">
                        <i class="fa-solid fa-palette"></i>
                        <span>Créer une DA</span>
                    </RouterLink>
                </li>
                <li :class="{ 'active': $route.path === '/account' }">
                    <RouterLink to="/">
                        <i class="fa-solid fa-user"></i>
                        <span>Compte</span>
                    </RouterLink>
                </li>
            </ul>
            <ul class="empty-links"></ul>
            <ul class="hamburger-wrapper" @click="toggleMenu">
                <li class="line"></li>
                <li class="line"></li>
                <li class="line"></li>
            </ul>
        </nav>
        <nav class="menu-mobile" :class="{ 'active': isMenuOpen }">
            <ul class="menu-links-list">
                <li>
                    <RouterLink to="/dashboard">
                        <span>Dashboard</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/create-da">
                        <span>Créer une DA</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/account">
                        <span>Compte</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </header>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const isMenuOpen = ref(false)

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
    console.log(isMenuOpen.value)
}

</script>

<style scoped>
.header{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding-top: var(--spacing-m);
    padding-bottom: var(--spacing-m);
}

.header .header-nav{
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header .header-nav-list{
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.header .nav-links{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: var(--spacing-m);
}
.header .nav-links li{
    background-color: var(--primary-grey);
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: 5rem;
    cursor: pointer;
    transition: all 0.6s ease-in-out;
}
.header .nav-links li a{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: var(--spacing-s);
}
.header .nav-links li.active{
    background-color: var(--beige-color);
    color: var(--black-color);
}
.header .nav-links li:hover{
    background-color: var(--beige-color);
    color: var(--black-color);
}


.logo{
    position: relative;
    z-index: 1000;
    width: calc(150 / 16 * 1rem);
}

.logo-mobile{
    display: none;
    position: relative;
    z-index: 1000;
    width: calc(50 / 16 * 1rem);
}

.header .hamburger-wrapper{
    display: none;
    position: relative;
    z-index: 1000;
}
.header .hamburger-wrapper .line{
    width: 20px;
    height: 2px;
    background-color: var(--beige-color);
}

.header .menu-mobile{
    display: none;
    position: fixed;
    top: 0;
    left: 100%;
    right: 0;
    z-index: 999;
    padding: var(--spacing-m);
    transition: all 0.6s ease-in-out;
    width: 100%;
    height: 100dvh;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
}

.header .menu-mobile.active{
    left: 0;
}
.header .menu-mobile .menu-links-list{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: var(--spacing-m);
}

.header .menu-mobile .menu-links-list li a span {
    font-size: var(--title-font-size) !important;
    color: var(--beige-color);
    text-align: center;
}


@media (max-width: 768px) {
    .logo-mobile{
        display: block;
    }
    .logo{
        display: none;
    }
}

@media (max-width: 576px) {
    .header .nav-links{
        display: none;
    }
    .header .empty-links{
        display: none;
    }
    .header .hamburger-wrapper{
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--spacing-xs);
        flex-direction: column;
    }
    .header .menu-mobile{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}
</style>