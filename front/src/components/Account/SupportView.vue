<template>
    <div class="support-container">
    <div class="support-content">
        <h2>Support</h2>
        <div class="form-wrapper">
            <form @submit.prevent="createTicket" class="form-container">
                <div class="form-group-wrapper">
                    <div class="form-group">
                        <UiInput v-model="subject" label="Sujet" placeholder="Entrer votre sujet" :type-input="'primary'" class="form-input" :size="'lg'" :required="true"/>
                    </div>

                    <div class="form-group">
                        <UiSelect v-model="category" label="Catégorie" :options="categoryList" :type-input="'primary'" class="form-select" :size="'lg'" :required="true"/>
                    </div>

                    <div class="form-group">
                        <UiSelect v-model="priority" label="Priorité" :options="priorityList" :type-input="'primary'" class="form-select" :size="'lg'" :required="true"/>
                    </div>
                    <div class="form-group">
                        <UiTextarea v-model="message" label="Message" :type-input="'primary'" class="form-textarea" :size="'lg'" :required="true"/>
                    </div>
                </div>
                <div class="form-group">
                    <UiButton text="Envoyer" :type="'submit'" :type-input="'primary'" class="form-button" :size="'lg'" :disabled="disableButton"/>
                </div>
            </form>
        </div>
        <div class="table-container">
            <h2>Mes tickets</h2>
            <UiTable :model="supportTicketsModel" :view="view" :reloadTrigger="reloadTrigger"/>
        </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import UiInput from '@/components/UiInput.vue';
import UiSelect from '@/components/UiSelect.vue';
import UiButton from '@/components/UiButton.vue';
import UiTable from '@/components/UiTable.vue';
import { createSupportTicket } from '@/ts/api/support';
import { ticketCategorySchema, ticketPrioritySchema} from '@/ts/api/validator/support';
import UiTextarea from '@/components/UiTextarea.vue';
import { useMessageStore } from '@/stores/message';
import type { View } from '@/ts/table/tableModel';
import { supportTicketsModel } from '@/taleModel/supportTicketModel';
const messageStore = useMessageStore();

const reloadTrigger = ref(0);
const view = ref<View>({})
const subject = ref<string>('');
const category = ref<string>('bug');
const priority = ref<string>('low');
const message = ref<string>('');

const createTicket = async () => {
    const safeCategory = ticketCategorySchema.parse(category.value);
    const safePriority = ticketPrioritySchema.parse(priority.value);

    try {
        await createSupportTicket({
            subject: subject.value,
            category: safeCategory,
            priority: safePriority,
            message: message.value,
        });
        messageStore.success('Ticket créé avec succès');
    } catch (error) {
        console.error(error);
        messageStore.error('Erreur lors de la création du ticket');
    }finally {
        resetForm();
        reloadTrigger.value++;
    }
};

const disableButton = computed(() => {
    return subject.value.length === 0 || category.value.length === 0 || priority.value.length === 0 || message.value.length === 0;
});

const resetForm = () => {
    subject.value = '';
    category.value = '';
    priority.value = '';
    message.value = '';
};

const categoryList = ref([
    { label: 'Bug', value: 'bug' },
    { label: 'Facturation', value: 'billing' },
    { label: 'Question', value: 'question' },
    { label: 'Autre', value: 'other' },
]);

const priorityList = ref([
    { label: 'Faible', value: 'low' },
    { label: 'Moyen', value: 'medium' },
    { label: 'Elevé', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
]);

</script>

<style scoped>
h2 {
    margin-bottom: var(--spacing-m);
}
.form-group-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-m);
}
.form-wrapper {
    background-color: var(--secondary-grey);
    padding: var(--spacing-m);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-m);
}

.form-container {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: var(--spacing-m);
}
.table-container h2{
    margin-bottom: var(--spacing-m);
}
</style>
