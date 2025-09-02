<template>
    <div class="toggle-container" 
    :class="{ 'toggled': props.modelValue }" 
    role="switch"
    :aria-checked="props.modelValue"
    tabindex="0"
    @click="toggle"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle">
        <div class="toggle-round"></div>
        <input type="checkbox" style="display: none;" :checked="props.modelValue" name="toggle-input" id="toggle-input" />
    </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'change', value: boolean): void
}>();

function toggle() {
    const newValue = !props.modelValue;
    emit('update:modelValue', newValue);
    emit('change', newValue);
}
</script>

<style scoped>

.toggle-container{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 50px;
    height: 25px;
    padding: 0.1rem;
    background-color: var(--beige-color);
    border-radius: 5rem;
    cursor: pointer;
    transition: all 0.6s ease-in-out;
}
.toggle-container.toggled{
    background-color: var(--secondary-color);
}
.toggle-round{
    width: 23px;
    height: 23px;
    transform: translateX(0);
    background-color: var(--secondary-color);
    border-radius: 50%;
    transition: all 0.6s ease-in-out;
}
.toggle-container.toggled .toggle-round{
    background-color: var(--beige-color);
    transform: translateX(100%);
}



</style>