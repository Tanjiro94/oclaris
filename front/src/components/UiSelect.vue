<template>
    <div class="input-container">
        <label v-if="props.label" :for="props.name">{{ props.label }}</label>
        
        <select
            :disabled="props.disabled"
            :id="props.id"
            :name="props.name"
            :class="props.className + ' ' + inputSize + ' ' + typeInputClass"
            :style="props.styleAttr"
            :value="props.modelValue"
            @change="onChange"
            @blur="onBlur"
            @focus="onFocus"
            @keyup="onKeyUp"
            @keydown="onKeyDown"
            @keypress="onKeyPress"
            @input="onInput"
        >
            <!-- Option placeholder si tu en veux une -->
            <option v-if="props.placeholder" disabled value="">
                {{ props.placeholder }}
            </option>

            <!-- Options passées en props -->
            <option
                v-for="option in props.options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.label }}
            </option>
        </select>
    </div>
</template>

<script lang="ts" setup>
import { computed, withDefaults } from 'vue';
import type { InputProps } from '@/ts/Input';

type SelectOption = {
    label: string;
    value: string | number;
};

type SelectProps = InputProps & {
    options: SelectOption[];
};

const props = withDefaults(defineProps<SelectProps>(), {
    modelValue: '',
    size: 'md',
    disabled: false,
    loading: false,
    error: false,
    typeInput: 'primary',
    name: 'select-form',
    id: 'select-form',
    options: () => [],
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void
    (e: 'change', value: string | number): void
    (e: 'blur'): void
    (e: 'focus'): void
    (e: 'keyUp'): void
    (e: 'keyDown'): void
    (e: 'keyPress'): void
    (e: 'keyup'): void
    (e: 'input', value: string | number): void
}>();

const model = computed({
    get: () => props.modelValue,
    set: (value: string | number) => {
        emit('update:modelValue', value);
    }
});

function getTargetValue(event: Event): string {
    const target = event.target as HTMLSelectElement;
    return target.value;
}

function onInput(event: Event) {
    const value = getTargetValue(event);
    model.value = value;
    emit('input', value);
}

function onChange(event: Event) {
    const value = getTargetValue(event);
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

.input-sm{
    width: calc(200 / 16 * 1rem);
}

.input-md{
    width: calc(250 / 16 * 1rem);
}

.input-lg{
    width: calc(350 / 16 * 1rem);
}

.input-container input,
.input-container select{
    padding: calc(14 / 16 * 1rem) calc(10 / 16 * 1rem);
    border-radius: var(--border-radius);
    border: none;
    outline: none;
    appearance: none;
}

.input-container input:focus,
.input-container select:focus{
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
