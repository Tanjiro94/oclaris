<template>
    <button
        type="button"
        class="button-custom"
        :class="[className, { selected, disabled }, type]"
        :disabled="disabled"
        @click.prevent.stop="onClick"
    >
    <div class="left-content">
        <slot name="left-content"></slot>
        <div class="label-content">{{ label }}</div>
    </div>

    <div class="right-content">
        <slot name="right-content"></slot>
        <div class="icon-content" v-if="selected">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            class="bi bi-check-lg"
            viewBox="0 0 16 16"
        >
            <path
            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"
            />
        </svg>
        </div>
    </div>
    </button>
</template>

<script setup lang="ts">
const props = defineProps<{
    label: string;
    selected?: boolean;
    disabled?: boolean;
    className?: string;
    type: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'quaternary';
}>();

const emit = defineEmits<{
    (e: "click"): void;
}>();

const onClick = () => {
    if (props.disabled) return;
    emit("click");
};
</script>

<style scoped>
.button-custom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}

.button-custom.primary {
    border-color: var(--primary-color);
    background-color: var(--primary-color);
}

.button-custom.secondary {
    border-color: var(--secondary-color);
    background-color: var(--secondary-color);
}

.button-custom.tertiary {
    border-color: var(--secondary-grey);
    background-color: var(--secondary-grey);
}

.button-custom.tertiary:hover {
    border-color: var(--secondary-grey-hover);
    background-color: var(--secondary-grey-hover);
}
.button-custom.quaternary {
    border-color: var(--beige-color);
    background-color: var(--primary-grey-hover);
}

.button-custom.quaternary:hover {
    border-color: var(--primary-grey-hover);
    background-color: var(--primary-grey-hover);
}


.button-custom.accent {
    border-color: var(--accent-color);
    background-color: var(--accent-color);
}

.button-custom.accent.selected {
    border-color: var(--accent-color);
    background-color: var(--accent-hover);
}

.button-custom.primary.selected {
    border-color: var(--primary-color);
    background-color: var(--primary-hover);
}

.button-custom.secondary.selected {
    border-color: var(--secondary-color);
    background-color: var(--secondary-hover);
}

.button-custom.tertiary.selected {
    border-color: var(--secondary-grey);
    background-color: var(--secondary-grey-hover);
}

.button-custom.quaternary.selected {
    border-color: var(--beige-color);
    background-color: var(--primary-grey);
}

.button-custom.accent.selected {
    border-color: var(--accent-color);
    background-color: var(--accent-hover);
}

.button-custom.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


.button-custom .left-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.button-custom .left-content .label-content {
    color: var(--beige-color);
}

.button-custom .right-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.button-custom .right-content .icon-content {
    width: 16px;
    height: 16px;
    /* background-color: #084B83; */
    fill: var(--beige-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
