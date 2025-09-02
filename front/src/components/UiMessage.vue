<template>
    <div class="message-container-fixed" :style="{ pointerEvents: props.isOpen ? 'auto' : 'none', backdropFilter: props.isOpen ? 'blur(2px)' : 'none' }">
        <div class="message-container">
            <transition name="slide-fade" mode="out-in">
                <div class="message-container content" :class="typeClass" v-show="props.isOpen">
                    <i :class="props.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
                    <p>{{ props.message }}</p>
                    <i class="fa-solid fa-xmark close-icon" @click="closeMessage"></i>
                    </div>
            </transition>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue';
const props = withDefaults(defineProps<{
    type: 'success' | 'error';
    message: string;
    isOpen: boolean;
}>(), {
    isOpen: false,
});

const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void
}>();

const typeClass = computed(() => {
    switch (props.type) {
        case 'success':
            return 'message-success';
        case 'error':
            return 'message-error';
        default:
            return 'message-success';
    }
});


function closeMessage() {
    emit('update:isOpen', false);
}
</script>

<style scoped>

.message-container-fixed{
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    z-index: 1000;
}

.message-container{
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: var(--spacing-s);
}

.message-container .content{
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-xl);
    padding: var(--spacing-m) var(--spacing-l);
    border-radius: var(--border-radius);
    min-width: 200px;
    width: fit-content;
    cursor: pointer;
}

.message-container.message-success{
    background-color: var(--success-color);
}
.message-container.message-success:hover{
    background-color: var(--success-hover);
}

.message-container.message-error{
    background-color: var(--error-color);
}
.message-container.message-error:hover{
    background-color: var(--error-hover);
}

.message-container .close-icon{
    cursor: pointer;
}

/* animation */
.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>