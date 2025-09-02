<template>
    <div class="input-container">
        <label v-if="props.label" :for="props.name">{{ props.label }}</label>
        <input :type="props.type" :disabled="props.disabled" :size="props.size" :loading="props.loading" :id="props.id" :name="props.name" :class="props.className + ' ' + inputSize + ' ' + typeInputClass" :style="props.styleAttr" :placeholder="props.placeholder" :value="props.modelValue" @change="onChange" @blur="onBlur" @focus="onFocus" @keyup="onKeyUp" @keydown="onKeyDown" @keypress="onKeyPress" @input="onInput" autocomplete="off" />
    </div>
</template>

<script lang="ts" setup>
import type { InputProps } from '@/ts/Input';
import { computed, withDefaults } from 'vue';

const props = withDefaults(defineProps<InputProps>(), {
    modelValue: '',
    size: 'md',
    type: 'text',
    disabled: false,
    loading: false,
    error: false,
    typeInput: 'primary',
    name: 'input-form',
    id: 'input-form',
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
    (e: 'blur'): void
    (e: 'focus'): void
    (e: 'keyUp'): void
    (e: 'keyDown'): void
    (e: 'keyPress'): void
    (e: 'keyup'): void
    (e: 'input', value: string): void
}>();

const model = computed({
    get: () => {
        return props.modelValue;
    },
    set: (value: string) => {
        emit('update:modelValue', value);
    }
});

function onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    model.value = value;
}

function onChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    emit('change', value);
    props.onChange?.(value);
}

function onFocus() {
    emit('focus');
    props.onFocus?.();
}

function onBlur() {
    emit('blur');
    props.onBlur?.();
}

function onKeyUp(event: KeyboardEvent) {
    emit('keyUp');
    props.onKeyUp?.(event);
}

function onKeyDown(event: KeyboardEvent) {
    emit('keyDown');
    props.onKeyDown?.(event);
}

function onKeyPress(event: KeyboardEvent) {
    emit('keyPress');
    props.onKeyPress?.(event);
}

const inputSize = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'input-sm';
        case 'md':
            return 'input-md';
        case 'lg':
            return 'input-lg';
    }
    return 'input-md';
});

const typeInputClass = computed(() => {
    switch (props.typeInput) {
        case 'primary':
            return 'input-primary';
        case 'secondary':
            return 'input-secondary';
    }
    return 'input-primary';
});
</script>

<style scoped>
.input-container{
    display: flex;
    flex-direction: column;
    gap: calc(10 / 16 * 1rem);
}

/* size */
.input-sm{
width: calc(200 / 16 * 1rem);
}

.input-md{
    width: calc(250 / 16 * 1rem);
}

.input-lg{
    width: calc(350 / 16 * 1rem);
}

.input-container input{
    padding: calc(14 / 16 * 1rem) calc(10 / 16 * 1rem);
    border-radius: var(--border-radius);
    border: none;
    outline: none;
}
.input-container input:focus{
    outline: 2px solid var(--primary-color);
}

/* type */
.input-primary{
    background-color: var(--primary-grey);
    color: var(--beige-color);
}
.input-primary:hover{
    background-color: var(--primary-grey-hover);
}
.input-secondary{
    background-color: var(--secondary-grey);
    color: var(--beige-color);
}
.input-secondary:hover{
    background-color: var(--secondary-grey-hover);
}

@media (max-width: 400px) {
    .input-sm{
        width: 100%;
    }
    .input-md{
        width: 100%;
    }
    .input-lg{
        width: 100%;
    }
}
</style>