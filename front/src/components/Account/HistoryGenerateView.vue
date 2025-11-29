<template>
    <div class="history-generate-container">
        <div class="history-generate-content">
            <h2>Historique des générations</h2>
        </div>

        <UiHeadAction className="history-generate-header">
            <template #left-content>
                <UiTag text="Tous" typeClass="secondary" :class="[statusFilter === 'all' ? 'active' : '', disableFilterSort ? 'disabled' : ''] " @click="disableFilterSort ? null : statusFilter = 'all'" :disabled="disableFilterSort"   />
                <UiTag text="Succès" typeClass="secondary" :class="[statusFilter === 'succeeded' ? 'active' : '', disableFilterSort ? 'disabled' : ''] " @click="disableFilterSort ? null : statusFilter = 'succeeded'" :disabled="disableFilterSort" />
                <UiTag text="Échec" typeClass="secondary" :class="[statusFilter === 'failed' ? 'active' : '', disableFilterSort ? 'disabled' : ''] " @click="disableFilterSort ? null : statusFilter = 'failed'" :disabled="disableFilterSort" />
                <select name="sort" id="sort" :disabled="disableFilterSort" :class="[disableFilterSort ? 'disabled' : '']" class="sort-select" v-model="sortOrder">
                    <option value="latest">Récent</option>
                </select>
            </template>
            <template #right-content>
                <p>Total : ({{ historyGenerations.total }})</p>
            </template>
        </UiHeadAction>
        <div class="history-generate-list">
            <UiTable :model="daHistoryModel" :view="historyGenerateView" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import UiTag from '@/components/UiTag.vue';
import UiHeadAction from '@/components/UiHeadAction.vue';
import { daApi } from '@/ts/api/da';
import type { ListGenerationJobsResponseDto } from '@/ts/api/validator/da';
import UiTable from '@/components/UiTable.vue';
import { daHistoryModel } from '@/taleModel/daHistoryModel';
import type { View } from '@/ts/table/tableModel';


const historyGenerateView = ref<View>({});

const sortOrder = ref<'latest' | 'oldest'>('latest');

const statusFilter = ref<'all' | 'succeeded' | 'failed'>('all');
const disableFilterSort = computed(() => {
    return historyGenerations.value.total === 0;
});
const historyGenerations = ref<ListGenerationJobsResponseDto>({
    data: [],
    total: 0,
});


const getHistoryGenerations = async () => {
    const response: ListGenerationJobsResponseDto = await daApi.getGenerationJobsForUser();
    historyGenerations.value = response;
};

/* const cliquableStatus = computed(() => {
    return statusFilter.value !== 'all';
}); */

watch(statusFilter, (status) => {
	const next: View = { ...(historyGenerateView.value || {}) };

	if (status === 'all') {
		if (next.filters) {
			delete next.filters.status;
			if (Object.keys(next.filters).length === 0) {
				next.filters = {};
			}
		}
	} else {
		next.filters = next.filters || {};
		next.filters.status = {
			expression: 'eq',
			value: status
		};
	}

	historyGenerateView.value = next;
});


onMounted(() => {
    getHistoryGenerations();
});
</script>

<style scoped>
h2{
    margin-bottom: var(--spacing-m);
}
.tag-secondary.active{
    background-color: var(--primary-color);
    color: var(--black-color);
}
.tag-secondary.disabled{
    opacity: 0.5;
    cursor: not-allowed;
}

.sort-select{
    border: none;
    outline: none;
    background-color: var(--primary-grey);
    color: var(--beige-color);
    padding: var(--spacing-s) var(--spacing-m);
    border-radius: 100px;
    font-size: var(--small-font-size);
    cursor: pointer;
}
.sort-select:disabled{
    opacity: 0.5;
    cursor: not-allowed;
}
</style>