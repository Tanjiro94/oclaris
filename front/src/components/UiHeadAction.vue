<template>
    <div class="head-action-container" :class="className">
        <div class="left-content">
            <slot name="left-content"></slot>
        </div>
        <div class="right-content">
            <slot name="right-content"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    className?: string;
}>();
</script>

<style scoped>
.head-action-container{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--secondary-grey);
    padding: var(--spacing-s);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-m);
}

.left-content{
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
}

.right-content{
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
}
</style>