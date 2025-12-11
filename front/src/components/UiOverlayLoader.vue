<template>
    <Transition name="overlay-fade">
        <div
            v-if="props.visible"
            class="ui-overlay-loader"
            aria-live="polite"
            aria-busy="true"
        >
            <div class="ui-overlay-backdrop"></div>

            <div class="ui-overlay-content">
                <div class="ui-overlay-spinner"></div>
                <p v-if="text" class="ui-overlay-text">
                    {{ props.text }}
                </p>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
const props = defineProps<{
    visible: boolean;
    text?: string;
}>();
</script>

<style scoped>
.ui-overlay-loader {
    position: fixed;
    inset: 0;
    z-index: 2000;
    pointer-events: auto;
}

.ui-overlay-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
}

.ui-overlay-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-m);
    padding: var(--spacing-m);
    text-align: center;
}

.ui-overlay-spinner {
    width: 48px;
    height: 48px;
    border-radius: 999px;
    border: 3px solid rgba(255, 255, 255, 0.25);
    border-top-color: var(--accent-color, #ff4d4f);
    animation: spin 0.8s linear infinite;
}

.ui-overlay-text {
    color: #ffffff;
    font-weight: 500;
    max-width: 420px;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
    transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
    opacity: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
