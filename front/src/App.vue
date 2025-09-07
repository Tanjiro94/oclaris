<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router';
import Header from '@/components/UiHeader.vue';
const route = useRoute();
import AppMessage from '@/components/AppMessage.vue';
</script>

<template>
  <div class="overlay-grid">
    <div class="container">
      <div class="row">
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
        <div class="col col-xl-1 col-md-1 col-sm-1 col-xs-1"><div class="col-test"></div></div>
      </div>
    </div>
  </div>

<Header v-if="route.path !== '/' && route.path !== '/register'" />

<main :class="route.path === '/' || route.path === '/register' ? 'no-padding' : 'main'">
  <router-view></router-view>
</main>
<AppMessage />
</template>

<style scoped>
main.main{
  padding-top: calc(80 / 16 * 1rem);
}

main.no-padding{
  padding-top: 0;
}
</style>
