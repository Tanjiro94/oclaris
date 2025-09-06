<script setup lang="ts">
import { RouterView } from 'vue-router'
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

<router-view></router-view>
<AppMessage />
</template>

<style scoped></style>
