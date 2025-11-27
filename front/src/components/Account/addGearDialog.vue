<template>
    <dialog-comp
        ref="dialogCompRef"
        :title="'Ajouter un équipement'"
        :subtitle="'Complète les champs pour ajouter un nouvel équipement.'"
        :placement="'banner'"
        :side="'right-top'"
        :width="'45%'"
        :height="'100%'"
        :buttons="buttons"
        @closed="emit('closed')"
        @open="emit('open')"
    >
        <template #dialog-content>
            <form class="gear-form" @submit.prevent>
                <div class="form-group gear-brand-group">
                    <UiInput
                        v-model="form.brand"
                        typeInput="primary"
                        size="lg"
                        name="brand"
                        id="gear-brand"
                        label="Marque"
                        :required="true"
                    />
                </div>
                <div class="form-group gear-model-group">
                    <UiInput
                        v-model="form.model"
                        typeInput="primary"
                        size="lg"
                        name="model"
                        id="gear-model"
                        label="Modèle"
                        :required="true"
                    />
                </div>
                <div class="form-group gear-type-group">
                    <h3 class="gear-type-group-title">
                        Type d'équipement
                        <span class="gear-type-group-title-required">*</span>
                    </h3>
                    <SelectableGroup
                        v-model="gearType"
                        mode="single"
                        :options="[
                            { label: 'Appareil photo', value: 'camera', type: 'quaternary' },
                            { label: 'Objectif',        value: 'lens',    type: 'quaternary' },
                            { label: 'Flash',           value: 'flash',   type: 'quaternary' },
                            { label: 'Accessoire',      value: 'accessory', type: 'quaternary' }
                        ]"
                        type="quaternary"
                    />
                </div>
            </form>
        </template>
    </dialog-comp>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import DialogComp from '@/components/UiDialog.vue';
import SelectableGroup from '@/components/SelectableGroup.vue';
import UiInput from '@/components/UiInput.vue';
import { gearApi } from '@/ts/api/gear.js';
import { useMessageStore } from '@/stores/message';

type GearType = 'camera' | 'lens' | 'flash' | 'accessory';

type Gear = {
    brand: string;
    model: string;
    type?: GearType;
};

const emit = defineEmits<{
    (e: 'open'): void;
    (e: 'closed'): void;
}>();

const dialogCompRef = ref<InstanceType<typeof DialogComp> | null>(null);
const gearType = ref<GearType>('camera');

const form = ref<Gear>({
    type: 'camera',
    brand: '',
    model: ''
});

type DialogButton = {
    label: string;
    icon?: string;
    disabled?: boolean;
    class?: string | '';
    typeClass?: 'btn-primary' | 'btn-secondary' | 'btn-danger' | 'btn-tertiary' | 'btn-quaternary';
    onClick?: () => void;
};

const messageStore = useMessageStore();
const loading = ref(false);

watch(gearType, (val) => {
    form.value.type = val;
});

const isValid = computed(() => {
    return (
        !!form.value.type &&
        form.value.brand.trim().length > 0 &&
        form.value.model.trim().length > 0
    );
});

const resetForm = () => {
    gearType.value = 'camera';
    form.value = {
        type: 'camera',
        brand: '',
        model: ''
    };
};

const createGear = async () => {
    if (!isValid.value || loading.value) return;

    loading.value = true;
    try {
        const response = await gearApi.createGear({
            type: form.value.type as GearType,
            brand: form.value.brand.trim(),
            model: form.value.model.trim()
        });
        console.log('gear créé :', response);

        messageStore.success('Équipement ajouté avec succès.');

        resetForm();
        dialogCompRef.value?.close();
    } catch (e) {
        console.error(e);
        messageStore.error('Une erreur est survenue lors de l’ajout du matériel.');
    } finally {
        loading.value = false;
    }
};

const buttons: DialogButton[] = [
    {
        label: 'Ajouter',
        typeClass: 'btn-primary',
        get disabled() {
            return !isValid.value || loading.value;
        },
        onClick: () => {
            createGear();
        }
    },
    {
        label: 'Annuler',
        typeClass: 'btn-secondary',
        onClick: () => {
            resetForm();
            dialogCompRef.value?.close();
        }
    }
];

onMounted(() => {
    dialogCompRef.value?.open();
    emit('open');
});
</script>

<style scoped>
.gear-type-group-title {
    margin-bottom: var(--spacing-s);
    color: var(--beige-color);
}
.gear-type-group-title-required {
    color: var(--accent-color);
}
.form-group {
    margin-bottom: var(--spacing-l);
}
.gear-type-group .selectable-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-s);
}
.gear-type-group .selectable-group .selectable-button {
    grid-column: span 1;
}
</style>
