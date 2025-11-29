<template>
    <div class="personnal-data-container">
        <div class="personnal-data-content">
            <div class="personnal-data-item personnal">
                <h2>Gérer mes informations personnelles</h2>
                <div class="personnal-data-item-content-wrapper">
                    <div class="personnal-data-item-content-item">
                        <UiInput
                            v-if="user"
                            label="Nom d'utilisateur"
                            type="text"
                            size="lg"
                            name="username"
                            id="username"
                            v-model="user.username"
                            typeInput="secondary"
                            disabled
                        />
                    </div>
                    <div class="personnal-data-item-content-item">
                        <UiInput
                            v-if="user"
                            label="Email"
                            type="email"
                            size="lg"
                            name="email"
                            id="email"
                            v-model="user.email"
                            typeInput="secondary"
                            disabled
                        />
                    </div>
                </div>
                <div class="reset-password-wrapper">
                    <UiButton text="Modifier mon mot de passe" typeClass="accent" type="button" @click="goToResetPassword" />
                </div>
            </div>

            <div class="personnal-data-item supplimental">
                <h2>Informations supplémentaires</h2>

                <div class="personnal-data-item-content-wrapper" v-if="gears.length > 0">
                    <div
                        class="personnal-data-item-content-item gear-item"
                        v-for="(gear, index) in gears"
                        :key="gear.id"
                    >
                        <UiInput
                            :label="translateGearType(gear.type)"
                            type="text"
                            size="lg"
                            :name="gear.model"
                            :id="gear.model + index"
                            v-model="gear.model"
                            typeInput="secondary"
                            disabled
                        />
                        <UiButton
                            text="Supprimer"
                            typeClass="accent"
                            type="button"
                            @click="openDeleteDialog(gear.id)"
                        />
                    </div>
                </div>

                <div class="reset-password-wrapper">
                    <UiButton
                        text="Ajouter du matériel"
                        typeClass="primary"
                        type="button"
                        @click="isDialogOpen = true"
                    />
                </div>
            </div>
        </div>
    </div>

    <add-gear-dialog
        v-if="isDialogOpen"
        @closed="handleAddGearClosed"
    />

    <dialog-comp
        v-if="isDeleteDialogOpen"
        ref="deleteDialogRef"
        :title="'Supprimer un matériel'"
        :subtitle="'Cette action est définitive.'"
        :placement="'center'"
        :width="'400px'"
        :height="'40%'"
        :buttons="deleteDialogButtons"
        @closed="onDeleteDialogClosed"
        @open="onDeleteDialogOpen"
    >
        <template #dialog-content>
            <p class="delete-dialog-content">Voulez-vous vraiment supprimer ce matériel ?</p>
        </template>
    </dialog-comp>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, nextTick } from 'vue';
import UiInput from '@/components/UiInput.vue';
import UiButton from '@/components/UiButton.vue';
import { gearApi } from '@/ts/api/gear.js';
import type { GearItem } from '@/ts/api/validator/gear.js';
import AddGearDialog from './addGearDialog.vue';
import { useMessageStore } from '@/stores/message';
import DialogComp from '@/components/UiDialog.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

type UserLite = {
    id: string;
    email: string;
    username: string;
};


const goToResetPassword = () => {
    router.push('/reset-password');
};

const props = defineProps<{
    user: UserLite | null;
}>();

const user = computed(() => props.user);

const gears = ref<GearItem[]>([]);
const isDialogOpen = ref(false);

const messageStore = useMessageStore();

const getGears = async () => {
    const response = await gearApi.getGear();
    gears.value = response.items;
};

type DialogButton = {
    label: string;
    icon?: string;
    disabled?: boolean;
    class?: string | '';
    typeClass?: 'btn-primary' | 'btn-secondary' | 'btn-danger' | 'btn-tertiary' | 'btn-quaternary';
    onClick?: () => void;
};

const isDeleteDialogOpen = ref(false);
const gearToDeleteId = ref<string | null>(null);
const deleteDialogRef = ref<InstanceType<typeof DialogComp> | null>(null);

const openDeleteDialog = async (id: string) => {
    gearToDeleteId.value = id;
    isDeleteDialogOpen.value = true;
    await nextTick();
    deleteDialogRef.value?.open();
};

const confirmDelete = async () => {
    if (!gearToDeleteId.value) return;
    try {
        await gearApi.deleteGear(gearToDeleteId.value);
        messageStore.success('Matériel supprimé avec succès.');
        await getGears();
    } catch (error) {
        console.error(error);
        messageStore.error('Une erreur est survenue lors de la suppression du matériel.');
    } finally {
        closeDeleteDialog();
    }
};

const closeDeleteDialog = () => {
    deleteDialogRef.value?.close();
    isDeleteDialogOpen.value = false;
    gearToDeleteId.value = null;
};

const deleteDialogButtons: DialogButton[] = [
    {
        label: 'Annuler',
        typeClass: 'btn-tertiary',
        onClick: () => {
            closeDeleteDialog();
        }
    },
    {
        label: 'Confirmer',
        typeClass: 'btn-danger',
        onClick: () => {
            confirmDelete();
        }
    }
];

const onDeleteDialogClosed = () => {
    isDeleteDialogOpen.value = false;
    gearToDeleteId.value = null;
};

const onDeleteDialogOpen = () => {
};

const handleAddGearClosed = async () => {
    isDialogOpen.value = false;
    await getGears();
};

type GearType = 'camera' | 'lens' | 'flash' | 'accessory';

const translateGearType = (type: GearType) => {
    switch (type) {
        case 'camera':
            return 'Caméra';
        case 'lens':
            return 'Objectif';
        case 'flash':
            return 'Flash';
        case 'accessory':
            return 'Accessoire';
        default:
            return type;
    }
};

onMounted(async () => {
    await getGears();
});
</script>

<style scoped>
h2{
    margin-bottom: var(--spacing-m);
}

.personnal-data-item-content-wrapper{
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-m);
    margin-bottom: var(--spacing-m);
}

.personnal-data-item.personnal{
    margin-bottom: var(--spacing-l);
}

.gear-item .input-container{
    margin-bottom: var(--spacing-s);
}

.delete-dialog-content{
    color: var(--beige-color);
}
</style>
