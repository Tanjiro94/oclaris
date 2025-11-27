<template>
    <dialog id="dialog-comp" :class="placementClass + ' ' + (props.placement === 'banner' ? sideClass : '')" ref="dialogRef">
        
        <div class="dialog-wrapper" :style="{ width: width, height: height }">
            <div class="header-wrapper" :style="{ 'justify-content': justifyContent }">
                <div class="head">
                    <h3>{{ title }}</h3>
                    <div class="close-button" @click="onCloseClick">
                        <button class="">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                            <i class="icon-cross"></i>
                        </button>
                    </div>
                </div>
                <div class="subtitle-wrapper">
                    <p class="subtitle">{{ subtitle }}</p>
                </div>
            </div>
            <div class="content-wrapper" ref="contentWrapperRef">
                <slot name="dialog-content"></slot>
            </div>
            <div class="footer-wrapper" v-if="hasButtons">
                <button v-for="button in buttons" :key="button.label" :disabled="button.disabled" :class="'btn ' + (button.class ? button.class + ' ' + button.typeClass : button.typeClass) + ' ' + (button.disabled ? 'disabled' : '')" @click="button.onClick">{{ button.label }}</button>
            </div>
        </div>
    </dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from 'vue';

type Button = {
    label: string;
    icon?: string;
    disabled?: boolean;
    class?: string | '';
    typeClass?: 'btn-primary' | 'btn-secondary' | 'btn-danger' | 'btn-tertiary' | 'btn-quaternary';
    onClick?: () => void;
}

const props = defineProps<{
    title?: string;
    subtitle?: string;
    width?: string;
    height?: string;
    placement: 'center' | 'banner';
    side?: 'left' | 'right' | 'top' | 'bottom' | 'left-bottom' | 'right-bottom' | 'left-top' | 'right-top'
    buttons? : Button[]
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const contentWrapperRef = ref<HTMLDivElement | null>(null);

const scrollToTop = () => {
    if (contentWrapperRef.value) {
        contentWrapperRef.value.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }
}

const emit = defineEmits<{
    (e: 'closed'): void;
    (e: 'open'): void;
}>();

const justifyContent = computed(() => {
    return props.title ? 'space-between' : 'flex-end';
});

const placementClass = computed(() => {
    return props.placement === 'center' ? 'center-dialog' : 'banner-dialog';
});

const sideClass = computed(() => {
    let className = '';

    if(props.side === 'left') className += 'left-dialog';
    if(props.side === 'right') className += 'right-dialog';
    if(props.side === 'top') className += 'top-dialog';
    if(props.side === 'bottom') className += 'bottom-dialog';
    if(props.side === 'left-bottom') className += 'left-bottom-dialog';
    if(props.side === 'right-bottom') className += 'right-bottom-dialog';
    if(props.side === 'left-top') className += 'left-top-dialog';
    if(props.side === 'right-top') className += 'right-top-dialog';

    return className;
});

const hasButtons = computed(() => {
    return props.buttons && props.buttons.length > 0;
});


const close = () => { 
    const el = dialogRef.value;
    if (el?.open) el.close();
};

const onCloseClick = () => {
    close();
    emit('closed');
};

const open = () => {
    const dialog = dialogRef.value
    if(!dialog || dialog.open) return;
    dialog.showModal();
    emit('open');
}

defineExpose({
    open,
    close,
    scrollToTop
});



</script>

<style>

#dialog-comp{
    position: fixed;
    inset: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    z-index: 999;
    /* backdrop-filter: blur(1.5px);
    background: rgba(0, 0, 0, 0.1); */
}
#dialog-comp[open]{
    display: flex;
    max-width: none !important;
    max-height: none !important;
    overflow: hidden;
    box-sizing: border-box;
}

dialog#dialog-comp::backdrop{
    backdrop-filter: blur(1.5px);
    background: rgba(0, 0, 0, 0.1);
}

/* .animate-dialog-backdrop-animation{
    animation: animate-dialog-backdrop-animation 1.5s ease-in-out;
}
@keyframes animate-dialog-backdrop-animation {
    0% {
        background: rgba(255, 95, 95, 0.5);
    }
    100% {
        background: rgba(0, 0, 0, 0.1);
    }
} */

dialog.top-dialog, dialog.bottom-dialog, dialog.left-dialog, dialog.right-dialog {
    display: flex;
}
dialog.center-dialog {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
dialog.center-dialog .dialog-wrapper{
    border-radius: 5px;
}

dialog.left-dialog {
    justify-content: flex-start;
}
dialog.right-dialog {
    justify-content: flex-end;
}
dialog.top-dialog {
    justify-content: center;
    align-items: flex-start;
}
dialog.bottom-dialog {
    justify-content: center;
    align-items: flex-end;
}
dialog.left-bottom-dialog {
    justify-content: flex-start;
    align-items: flex-end;
}
dialog.right-bottom-dialog {
    justify-content: flex-end;
    align-items: flex-end;
}
dialog.left-top-dialog {
    justify-content: flex-start;
    align-items: flex-start;
}
dialog.right-top-dialog {
    justify-content: flex-end;
    align-items: flex-start;
}
dialog .dialog-wrapper{
    padding: 12px 16px;
    padding-top: 0;
    background-color: var(--secondary-grey);
    box-shadow: -10px -1px 10px 2px rgba(0, 0, 0, 0.1);
    /* padding-left: 24px; */
    position: relative;
}
dialog .dialog-wrapper .header-wrapper{
    margin-bottom: var(--spacing-xl);
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
dialog .dialog-wrapper .header-wrapper .head{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.dialog-wrapper .header-wrapper h3{
    font-size: 13pt;
    margin: 0;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--beige-color);
}
.dialog-wrapper .subtitle-wrapper .subtitle{
    font-size: 10pt;
    color: var(--beige-color);
}
.dialog-wrapper .header-wrapper .close-button button{
    cursor: pointer;
    background: var(--primary-color);
    color: var(--beige-color);
    width: 30px;
    box-sizing: border-box;
    height: 30px;
    padding: 5px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

dialog .dialog-wrapper button {
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.6s ease-in-out;
}

dialog .dialog-wrapper button.btn-primary {
    background: var(--primary-color);
    color: var(--beige-color);
    &:hover {
        background: var(--primary-hover);
        color: var(--black-color);
    }
}

dialog .dialog-wrapper button.btn-secondary {
    background: var(--secondary-grey);
    color: var(--beige-color);
    &:hover {
        background: var(--primary-grey-hover);
        color: var(--beige-color);
    }
}
dialog .dialog-wrapper button.btn-tertiary {
    background: var(--primary-grey);
    color: var(--beige-color);
    &:hover {
        background: var(--primary-grey-hover);
        color: var(--beige-color);
    }
}

dialog .dialog-wrapper button.btn-danger {
    background: var(--accent-color);
    color: var(--beige-color);
    &:hover {
        background: var(--accent-hover);
        color: var(--black-color);
    }
}
dialog .dialog-wrapper button.disabled{
    opacity: 0.5;
    cursor: not-allowed;
}

.dialog-wrapper .content-wrapper{
    /* max-height: 670px; */
    height: 80%;
    overflow-y: auto;
    margin-bottom: 12px;
}

.dialog-wrapper .footer-wrapper{
    display: flex;
    justify-content: flex-start;
    gap: 12px;
    position: absolute;
    bottom: 24px;
}
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
