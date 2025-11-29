<template>
	<div class="ui-table">
		<!-- Erreur -->
		<div v-if="tv.error.value" class="error-table-view">
			{{ tv.error.value }}
		</div>

		<!-- Loading -->
		<div v-else-if="tv.loading.value" class="loading-view">
			<div class="columns-skeleton">
				<UiSkeleton
					v-for="column in visibleColumns"
					:key="column.id"
					:height="'20px'"
					:loading="true"
				/>
				<UiSkeleton
					v-if="actionsColumn"
					:height="'20px'"
					:loading="true"
				/>
			</div>
			<div class="rows-skeleton">
				<UiSkeleton
					v-for="i in 8"
					:key="i"
					:width="'100%'"
					:height="'30px'"
					:loading="true"
				/>
			</div>
		</div>

		<!-- Table -->
		<div
			v-else
			class="table-container"
		>
			<table v-if="tv.data.value.length > 0">
				<thead>
					<tr class="header-table-row">
						<th
							v-for="column in visibleColumns"
							:key="column.id"
							:style="{
								width: size(column),
								minWidth: size(column),
								textAlign: column.align || 'left'
							}"
							:title="column.tooltip"
						>
							<div class="th-content">
								<!-- Icône de tri -->
								<div
									v-if="column.sortable"
									class="sort-icon-wrapper"
								>
									<template
										v-if="
											currentView.sort?.field === column.key &&
											currentView.sort?.order === 'asc'
										"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											class="bi bi-arrow-up"
											viewBox="0 0 16 16"
											@click="onSort({ field: column.key, order: 'desc' })"
										>
											<path
												fill-rule="evenodd"
												d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"
											/>
										</svg>
									</template>
									<template
										v-else-if="
											currentView.sort?.field === column.key &&
											currentView.sort?.order === 'desc'
										"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											class="bi bi-arrow-down"
											viewBox="0 0 16 16"
											@click="onSort({ field: column.key, order: null })"
										>
											<path
												fill-rule="evenodd"
												d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
											/>
										</svg>
									</template>
									<template v-else>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											fill="currentColor"
											class="bi bi-arrow-down-up"
											viewBox="0 0 16 16"
											@click="onSort({ field: column.key, order: 'asc' })"
										>
											<path
												fill-rule="evenodd"
												d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"
											/>
										</svg>
									</template>
								</div>

								<!-- Icône de colonne -->
								<template v-if="column.icon">
									<span
										v-if="column.onlyIcon"
										v-html="column.icon"
									></span>
									<span
										v-else
										:class="column.icon"
									></span>
								</template>

								<!-- Label -->
								<span v-if="!column.onlyIcon">
									{{ column.label }}
								</span>
							</div>
						</th>

						<th
							v-if="actionsColumn"
							class="actions-column"
						>
							Actions
						</th>
					</tr>
				</thead>

				<tbody>
					<tr
						v-for="(row, index) in tv.data.value"
						:key="getRowKey(row, index)"
					>
						<td
							v-for="column in visibleColumns"
							:key="column.id"
							:style="{
								width: size(column),
								minWidth: size(column),
								textAlign: column.align || 'left'
							}"
						>
							{{ (row as Row)[column.key] }}
						</td>

						<td
							v-if="actionsColumn"
							class="actions-table-container"
						>
							<span
								v-for="action in model.rowActions"
								:key="action.label + '-btn'"
								:class="['action-button', action.className]"
								@click="runAction(action, row)"
							>
								<i
									v-if="action.icon"
									:class="action.icon"
								></i>
								{{ getActionLabel(action, row) }}
							</span>
						</td>
					</tr>
				</tbody>
			</table>

			<div
				v-else
				class="empty-view"
			>
				Aucune donnée à afficher.
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" generic="Row extends RowWithId = RowWithId">
import { computed, watch } from 'vue';
import type {
	TableModel,
	DataRes,
	View,
	ColDef,
	RowAction,
	RowWithId
} from '@/ts/table/tableModel';
import { TableView } from '@/ts/table/tableView';
import UiSkeleton from '@/components/UiSkeleton.vue';

const props = defineProps<{
	model: TableModel<Row, DataRes<Row>>;
	view: View;
	reloadTrigger?: number;
}>();

watch(
	() => props.view,
	(newView) => {
		tv.setView(newView);
	},
	{ deep: true }
);

watch(
	() => props.reloadTrigger,
	() => {
		tv.refreshData();
	}
);


const model = props.model;

let tv = new TableView<Row, DataRes<Row>>(props.model, props.view || {});

watch(
	() => props.model,
	(m) => {
		tv = new TableView<Row, DataRes<Row>>(m, props.view || {});
	},
);

const visibleColumns = computed(() => {
	return props.model.columns.filter((column) => column.show !== false);
});

const currentView = computed(() => tv.view.value);

const actionsColumn = computed(() => {
	return props.model.rowActions.length > 0;
});

const size = (column: ColDef) => {
	switch (column.size) {
		case 'xs':
			return '80px';
		case 's':
			return '120px';
		case 'm':
			return '180px';
		case 'l':
			return '240px';
		case 'xl':
			return '300px';
		case 'custom':
			return (
				props.model.columns.find((c) => c.id === column.id)?.customSize ??
				'auto'
			);
		default:
			return 'auto';
	}
};

function onSort(payload: { field: string | null; order: 'asc' | 'desc' | null }) {
	const next: View = { ...tv.view.value };
	if (payload.field && payload.order) {
		next.sort = { field: payload.field, order: payload.order };
	} else {
		next.sort = undefined;
	}
	tv.setView(next);
}

const getRowKey = (row: Row, index: number) => {
	const r: Row = row;
	return r._id ?? r.id ?? index;
};

const getActionLabel = (action: RowAction<Row>, row: Row) => {
	return typeof action.label === 'function' ? action.label(row) : action.label;
};

const runAction = async (action: RowAction<Row>, row: Row) => {
	try {
		const result = action?.execute?.(row);
		await Promise.resolve(result);
	} catch (e) {
		console.error(e);
	} finally {
		tv.refreshData();
	}
};
</script>

<style scoped>
.ui-table {
	width: 100%;
}

/* container + table */

.table-container {
	overflow-x: auto;
	width: 100%;
	max-width: 100%;
	background: var(--secondary-grey);
	border-radius: 8px;
	padding: 12px 0;
}

.table-container table {
	min-width: 100%;
	border-collapse: collapse;
	table-layout: fixed;
	width: auto;
}

.table-container thead {
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-table-row {
	background: var(--primary-grey);
}

.table-container th,
.table-container td {
	text-align: left;
	white-space: nowrap;
	vertical-align: middle;
	padding: 8px 12px;
	font-size: var(--small-font-size);
	color: var(--beige-color);
}

.table-container tbody tr:nth-child(even) {
	background-color: rgba(255, 255, 255, 0.02);
}

.table-container tbody tr:nth-child(odd) {
	background-color: transparent;
}

.table-container tbody tr:hover {
	background-color: rgba(255, 255, 255, 0.04);
}

/* header content */

.th-content {
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.sort-icon-wrapper svg {
	cursor: pointer;
}

/* Actions */

.actions-column {
	text-align: right !important;
}

.actions-table-container {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

.action-button {
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 999px;
	font-size: 11px;
	background: rgba(255, 255, 255, 0.04); 
    color: var(--beige-color);
    transition: background 0.2s, color 0.2s;
}

.action-button:hover {
	background: var(--primary-purple, #a855f7);
	color: #fff;
}

/* Loading / erreur / vide */

.error-table-view {
	padding: 12px;
	border-radius: 8px;
	background: rgba(255, 0, 0, 0.1);
	color: #ffb3b3;
}

.loading-view {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.columns-skeleton {
	display: flex;
	justify-content: space-between;
	gap: 8px;
}

.rows-skeleton {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.empty-view {
	padding: 16px;
	text-align: center;
	color: rgba(255, 255, 255, 0.5);
}
</style>
