<template>
    <Message :message="messageStore.message" :type="messageStore.type" :isOpen="messageStore.isOpen" @update:isOpen="value => { 
        if(!value) {
            messageStore.close();
        }
    }" />
</template>

<script lang="ts" setup>
import { useMessageStore } from '@/stores/message';
import Message from '@/components/UiMessage.vue';

const messageStore = useMessageStore();

</script>

<style scoped>

</style>