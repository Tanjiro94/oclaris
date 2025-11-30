<template>
    <div class="textarea-container">
        <label v-if="props.label" :for="props.name" :class="props.labelClass">{{ props.label }}<span v-if="props.required" class="required-asterisk"> *</span></label>
        <textarea :disabled="props.disabled" :size="props.size" :loading="props.loading" :id="props.id" :name="props.name" :class="props.className + ' ' + inputSize + ' ' + typeInputClass + ' ' + fullWidthClass + ' ' + fullHeightClass" :style="props.styleAttr" :placeholder="props.placeholder" :value="props.modelValue" @change="onChange" @blur="onBlur" @focus="onFocus" @keyup="onKeyUp" @keydown="onKeyDown" @keypress="onKeyPress" @input="onInput" autocomplete="off" :required="props.required" ></textarea>
    </div>
</template>

<script lang="ts" setup>
import type { InputProps } from '@/ts/Input';
import { computed, withDefaults } from 'vue';

const props = withDefaults(defineProps<InputProps>(), {
    modelValue: '',
    size: 'md',
    disabled: false,
    loading: false,
    error: false,
    typeInput: 'primary',
    name: 'input-form',
    id: 'input-form',
    labelClass: 'label-primary',
    required: false,
    className: '',
    fullWidth: false,
    fullHeight: false,
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

const fullWidthClass = computed(() => {
    if(props.fullWidth) return 'textarea-full-width';
    return '';
});

const fullHeightClass = computed(() => {

    if(props.fullHeight) return 'textarea-full-height';
    return '';
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
            return 'textarea-sm';
        case 'md':
            return 'textarea-md';
        case 'lg':
            return 'textarea-lg';
    }
    return 'textarea-md';
});

const typeInputClass = computed(() => {
    switch (props.typeInput) {
        case 'primary':
            return 'textarea-primary';
        case 'secondary':
            return 'textarea-secondary';
    }
    return 'textarea-primary';
});
</script>

<style scoped>
.textarea-container{
    display: flex;
    flex-direction: column;
    gap: calc(10 / 16 * 1rem);
}

.textarea-full-width{
    width: 100% !important;
}

.textarea-full-height{
    height: 100% !important;
}

/* size */
.textarea-sm{
width: calc(200 / 16 * 1rem);
}

.textarea-md{
    width: calc(250 / 16 * 1rem);
}

.textarea-lg{
    width: calc(500 / 16 * 1rem);
}

.textarea-container textarea{
    padding: calc(14 / 16 * 1rem) calc(10 / 16 * 1rem);
    border-radius: var(--border-radius);
    border: 2px solid transparent;
    outline: none;
    resize: none;
    height: calc(150 / 16 * 1rem);
    max-height: calc(250 / 16 * 1rem);
    font-size: var(--small-font-size);
}
.textarea-container textarea:focus{
    border-color: var(--primary-color);
}

/* type */
.textarea-primary{
    background-color: var(--primary-grey);
    color: var(--beige-color);
}
.textarea-primary:hover{
    background-color: var(--primary-grey-hover);
}
.textarea-secondary{
    background-color: var(--secondary-grey);
    color: var(--beige-color);
}
.textarea-secondary:hover{
    background-color: var(--secondary-grey-hover);
}

/* label */
.label-primary{
    color: var(--beige-color);
}
.label-secondary{
    color: var(--primary-color);
}
.label-tertiary{
    color: var(--secondary-color);
}
.label-accent{
    color: var(--accent-color);
}
.label-success{
    color: var(--success-color);
}

.required-asterisk{
    color: var(--accent-color);
}

@media (max-width: 400px) {
    .textarea-sm{
        width: 100%;
    }
    .textarea-md{
        width: 100%;
    }
    .textarea-lg{
        width: 100%;
    }
}
</style>