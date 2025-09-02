<template>
    <div class="tag-container" :class="props.className + ' ' + typeClass">
        <p>{{ props.text }}</p>
    </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, withDefaults } from 'vue';
const props = withDefaults(defineProps<{
    text: string;
    className?: string;
    typeClass?: string;
}>(), {
    className: '',
    typeClass: 'primary',
});



const typeClass = computed(() => {
    switch (props.typeClass) {
        case 'primary':
            return 'tag-primary';
        case 'secondary':
            return 'tag-secondary';
        case 'tertiary':
            return 'tag-tertiary';
        case 'accent':
            return 'tag-accent';
        case 'success':
            return 'tag-success';
        case 'error':
            return 'tag-error';
        default:
            return 'tag-primary';
    }
});
</script>

<style scoped>
.tag-container{
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: 5rem;
    cursor: pointer;
    transition: all 0.6s ease-in-out;
    width: fit-content;
}
.tag-container p{
    font-size: var(--small-font-size);
}

/* primary */
.tag-primary{
    background-color: var(--primary-color);
    color: var(--black-color);
}
.tag-primary:hover{
    background-color: var(--primary-hover);
}

/* secondary */
.tag-secondary{
    background-color: var(--primary-grey);
    color: var(--beige-color);
}
.tag-secondary:hover{
    background-color: var(--primary-grey-hover);
}

/* tertiary */
.tag-tertiary{
    background-color: var(--secondary-grey);
    color: var(--beige-color);
}
.tag-tertiary:hover{
    background-color: var(--secondary-grey-hover);
}

/* accent */
.tag-accent{
    background-color: var(--accent-color);
    color: var(--black-color);
}
.tag-accent:hover{
    background-color: var(--accent-hover);
}

/* success */
.tag-success{
    background-color: var(--success-color);
    color: var(--beige-color);
}
.tag-success:hover{
    background-color: var(--success-hover);
}

/* error */
.tag-error{
    background-color: var(--error-color);
    color: var(--beige-color);
}
.tag-error:hover{
    background-color: var(--error-hover);
}
</style>