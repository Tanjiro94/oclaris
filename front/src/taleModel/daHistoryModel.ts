import type {
	TableModel,
	AtomicDataRes,
	View,
	ColDef,
	RowWithId
} from '@/ts/table/tableModel';
import { daApi } from '@/ts/api/da';
import type {
	ListGenerationJobsResponseDto,
	GenerationJobListItemDto,
	ListGenerationJobsQueryDto
} from '@/ts/api/validator/da';

type DaHistoryRow = RowWithId & {
	name: string;
	createdAt: string;
	status: string;
	duration: number | null;
	params: unknown | null;
	message: string | null;
};

const columns: ColDef[] = [
	{
		id: 1,
		label: 'Nom du modèle',
		key: 'name',
		type: 'text',
		show: true,
		sortable: {
			key: 'name',
			options: [
				{ label: 'A–Z', value: 'asc' },
				{ label: 'Z–A', value: 'desc' }
			]
		}
	},
	{
		id: 2,
		label: 'Créée le',
		key: 'createdAt',
		type: 'text',
		show: true,
		sortable: {
			key: 'createdAt',
			options: [
				{ label: 'Plus récentes', value: 'desc' },
				{ label: 'Plus anciennes', value: 'asc' }
			]
		}
	},
	{
		id: 3,
		label: 'Statut',
		key: 'status',
		filterable: {
			key: 'status',
			options: [
				{ label: 'Tous', value: 'all', expression: 'eq' },
				{ label: 'Succès', value: 'succeeded', expression: 'eq' },
				{ label: 'Échec', value: 'failed', expression: 'eq' }
			]
		},
		type: 'text',
		show: true
	},
	{
		id: 4,
		label: 'Durée (ms)',
		key: 'duration',
		type: 'text',
		show: true
	}
];

function formatDate(value: Date | string | null): string {
	if (!value) return '';
	if (value instanceof Date) {
		return value.toISOString();
	}
	return value;
}

async function getData(view: View): Promise<AtomicDataRes<DaHistoryRow>> {

	const params: ListGenerationJobsQueryDto = {}

	const statusFilter = view.filters?.status;
	if (statusFilter && statusFilter.expression === 'eq') {
		const value = statusFilter.value;
		
		if (value !== 'all' && typeof value === 'string') {
			params.status = value as ListGenerationJobsQueryDto['status'];
		}
	}
	const response: ListGenerationJobsResponseDto =
		await daApi.getGenerationJobsForUser();

	const rawRows: GenerationJobListItemDto[] = response.data;

	let rows: DaHistoryRow[] = rawRows.map((item, index) => ({
		_id: item.id ?? index,
		name: item.model ?? 'Sans nom',
		createdAt: formatDate(item.started_at),
		status: item.status,
		duration: item.duration ?? null,
		params: item.params ?? null,
		message: item.message ?? null
	}));

	if (view.sort?.field) {
		const { field, order } = view.sort;
		const dir = order === 'desc' ? -1 : 1;

		rows = [...rows].sort((a, b) => {
			const av = a[field as keyof DaHistoryRow];
			const bv = b[field as keyof DaHistoryRow];

			if (av == null && bv == null) return 0;
			if (av == null) return -1 * dir;
			if (bv == null) return 1 * dir;

			if (typeof av === 'number' && typeof bv === 'number') {
				return (av - bv) * dir;
			}

			return String(av).localeCompare(String(bv)) * dir;
		});
	}

	return {
		rows,
		view,
		stats: [
			{
				label: 'Total jobs',
				value: response.total,
				type: 'primary'
			}
		]
	};
}

async function insert(row: DaHistoryRow): Promise<'not-implemented'> {
	console.log('insert', row);
	return Promise.resolve('not-implemented');
}

async function update(row: DaHistoryRow & { id: string }): Promise<'not-implemented'> {
	console.log('update', row);
	return Promise.resolve('not-implemented');
}

export const daHistoryModel: TableModel<
	DaHistoryRow,
	AtomicDataRes<DaHistoryRow>
> = {
	columns,
	getData,
	rowActions: [],
	globalActions: [],
	selectable: false,
	readonly: true,
	insert,
	update
};
