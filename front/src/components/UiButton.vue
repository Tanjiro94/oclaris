<template>
    <button class="button" :class="props.className + ' ' + typeClass + ' ' + sizeClass" :style="props.styleAttr" :disabled="props.disabled" :loading="props.loading" :type="props.type" :id="props.id" :name="props.name" @click="props.action">
        <i :class="props.icon"></i>
        <span>{{ props.text }}</span>
    </button>
</template>

<script lang="ts" setup>
import type { ButtonProps } from '@/ts/Button';
import { computed } from 'vue';
const props = defineProps<ButtonProps>();

const typeClass = computed(() => {
    if(!props.typeClass) return 'button-primary';
    switch (props.typeClass) {
    case 'primary':
        return 'button-primary';
    case 'secondary':
        return 'button-secondary';
    case 'tertiary':
        return 'button-tertiary';
    case 'accent':
        return 'button-accent';
    default:
        return 'button-primary';
    }
});

const sizeClass = computed(() => {
    if(!props.size) return 'button-md';
    switch (props.size) {
        case 'sm':
            return 'button-sm';
        case 'md':
            return 'button-md';
        case 'lg':
            return 'button-lg';
    default:
        return 'button-md';
    }
});

</script>

<style scoped>
.button{
    padding: calc(10 / 16 * 1rem) calc(40 / 16 * 1rem);
    border-radius: var(--border-radius);
    border: none;
    cursor: pointer;
    transition: all 0.6s ease-in-out;
}

/* size */
.button-sm{
    min-width: 100px;
}
.button-md{
    min-width: 150px;
}
.button-lg{
    min-width: 250px;
}

/* type */
.button-primary{
    background-color: var(--primary-color);
    color: var(--black-color);
}
.button-primary:hover{
    background-color: var(--primary-hover);
}
.button-secondary{
    background-color: var(--primary-grey);
    color: var(--beige-color);
}
.button-secondary:hover{
    background-color: var(--primary-grey-hover);
}
.button-tertiary{
    background-color: var(--secondary-grey);
    color: var(--beige-color);
}
.button-tertiary:hover{
    background-color: var(--secondary-grey-hover);
}
.button-accent{
    background-color: var(--accent-color);
    color: var(--black-color);
}
.button-accent:hover{
    background-color: var(--accent-hover);
}
</style>