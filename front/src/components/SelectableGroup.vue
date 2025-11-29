<template>
    <div class="selectable-group" :class="groupClass">
    <template v-for="option in options" :key="option.value">
        <slot
        name="option"
        :option="option"
        :selected="isSelected(option.value)"
        :toggle="() => toggle(option.value)"
        >
        <SelectableButton
            :type="type"
            :label="option.label"
            :selected="isSelected(option.value)"
            :className="buttonClass"
            :disabled="disabled"
            @click="toggle(option.value)"
        />
        </slot>
    </template>
    </div>
</template>

<script setup lang="ts">
import SelectableButton from "./SelectableButton.vue";

type Mode = "single" | "multiple";

type Option = {
    label: string;
    value: string | number;
    type: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'quaternary';
};

const props = defineProps<{
    modelValue: string | number | (string | number)[] | null;
    mode: Mode;
    options: Option[];
    disabled?: boolean;
    buttonClass?: string;
    groupClass?: string;
    type: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'quaternary';
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number | (string | number)[] | null): void;
}>();

const isSelected = (value: string | number): boolean => {
    if (props.mode === "single") {
    return props.modelValue === value;
    }

    const current = Array.isArray(props.modelValue) ? props.modelValue : [];
    return current.includes(value);
};

const toggle = (value: string | number) => {
    if (props.disabled) return;

    if (props.mode === "single") {
    const next = props.modelValue === value ? null : value;
    emit("update:modelValue", next);
    } else {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];

    if (current.includes(value)) {
        const next = current.filter((v) => v !== value);
        emit("update:modelValue", next);
    } else {
        emit("update:modelValue", [...current, value]);
    }
    }
};
</script>

<style scoped>
.selectable-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>
