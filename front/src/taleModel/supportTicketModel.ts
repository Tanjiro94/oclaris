import type {
	TableModel,
	AtomicDataRes,
	View,
	ColDef,
	RowWithId
} from '@/ts/table/tableModel';

import { listSupportTickets } from '@/ts/api/support';
import { formatDateToShort } from '@/ts/utils/formateDate';

import type {
	SupportTicketListItemDto,
	ListSupportTicketsQueryDto,
	TicketCategory,
	TicketPriority,
	TicketStatus
} from '@/ts/api/validator/support';

type SupportTicketRow = RowWithId & {
	subject: string;
	category: string;
	priority: string;
	status: string;
	createdAt: string;
};

const columns: ColDef[] = [
	{
		id: 1,
		label: 'Sujet',
		key: 'subject',
		type: 'text',
		show: true,
		sortable: {
			key: 'subject',
			options: [
				{ label: 'A–Z', value: 'asc' },
				{ label: 'Z–A', value: 'desc' }
			]
		}
	},
	{
		id: 2,
		label: 'Catégorie',
		key: 'category',
		type: 'text',
		show: true,
		filterable: {
			key: 'category',
			options: [
				{ label: 'Toutes', value: 'all', expression: 'eq' },
				{ label: 'Bug', value: 'bug', expression: 'eq' },
				{ label: 'Facturation', value: 'billing', expression: 'eq' },
				{ label: 'Question', value: 'question', expression: 'eq' },
				{ label: 'Autre', value: 'other', expression: 'eq' }
			]
		}
	},
	{
		id: 3,
		label: 'Priorité',
		key: 'priority',
		type: 'text',
		show: true,
		filterable: {
			key: 'priority',
			options: [
				{ label: 'Toutes', value: 'all', expression: 'eq' },
				{ label: 'Basse', value: 'low', expression: 'eq' },
				{ label: 'Moyenne', value: 'medium', expression: 'eq' },
				{ label: 'Haute', value: 'high', expression: 'eq' },
				{ label: 'Urgente', value: 'urgent', expression: 'eq' }
			]
		}
	},
	{
		id: 4,
		label: 'Statut',
		key: 'status',
		type: 'text',
		show: true,
		filterable: {
			key: 'status',
			options: [
				{ label: 'Tous', value: 'all', expression: 'eq' },
				{ label: 'Ouverts', value: 'open', expression: 'eq' },
				{ label: 'En cours', value: 'in_progress', expression: 'eq' },
				{ label: 'Résolus', value: 'resolved', expression: 'eq' },
				{ label: 'Fermés', value: 'closed', expression: 'eq' }
			]
		}
	},
	{
		id: 5,
		label: 'Créé le',
		key: 'createdAt',
		type: 'text',
		show: true,
		sortable: {
			key: 'createdAt',
			options: [
				{ label: 'Plus récents', value: 'desc' },
				{ label: 'Plus anciens', value: 'asc' }
			]
		}
	}
];

function translateStatus(status: TicketStatus): string {
	switch (status) {
		case 'open':
			return 'Ouvert';
		case 'in_progress':
			return 'En cours';
		case 'resolved':
			return 'Résolu';
		case 'closed':
			return 'Fermé';
		default:
			return 'Inconnu';
	}
}

function translateCategory(category: TicketCategory): string {
	switch (category) {
		case 'bug':
			return 'Bug';
		case 'billing':
			return 'Facturation';
		case 'question':
			return 'Question';
		case 'other':
			return 'Autre';
		default:
			return 'Inconnu';
	}
}

function translatePriority(priority: TicketPriority): string {
	switch (priority) {
		case 'low':
			return 'Basse';
		case 'medium':
			return 'Moyenne';
		case 'high':
			return 'Haute';
		case 'urgent':
			return 'Urgent';
		default:
			return 'Inconnu';
	}
}

async function getData(view: View): Promise<AtomicDataRes<SupportTicketRow>> {
	const params: ListSupportTicketsQueryDto = {};

	const statusFilter = view.filters?.status;
	if (statusFilter && statusFilter.expression === 'eq') {
		const value = statusFilter.value;
		if (value !== 'all' && typeof value === 'string') {
			params.status = value as ListSupportTicketsQueryDto['status'];
		}
	}

	const categoryFilter = view.filters?.category;
	if (categoryFilter && categoryFilter.expression === 'eq') {
		const value = categoryFilter.value;
		if (value !== 'all' && typeof value === 'string') {
			params.category = value as ListSupportTicketsQueryDto['category'];
		}
	}

	const priorityFilter = view.filters?.priority;
	if (priorityFilter && priorityFilter.expression === 'eq') {
		const value = priorityFilter.value;
		if (value !== 'all' && typeof value === 'string') {
			params.priority = value as ListSupportTicketsQueryDto['priority'];
		}
	}

	const response = await listSupportTickets(params);

	const rawItems: SupportTicketListItemDto[] =
		response.items;

	const total: number = response.total;

	let rows: SupportTicketRow[] = rawItems.map((item, index) => ({
		_id: item.id ?? index,
		subject: item.subject,
		category: translateCategory(item.category),
		priority: translatePriority(item.priority),
		status: translateStatus(item.status),
		createdAt: formatDateToShort(new Date(item.created_at))
	}));

	if (view.sort?.field) {
		const { field, order } = view.sort;
		const dir = order === 'desc' ? -1 : 1;

		rows = [...rows].sort((a, b) => {
			const av = a[field as keyof SupportTicketRow];
			const bv = b[field as keyof SupportTicketRow];

			if (av == null && bv == null) return 0;
			if (av == null) return -1 * dir;
			if (bv == null) return 1 * dir;

			if (typeof av === 'number' && typeof bv === 'number') {
				return (av - bv) * dir;
			}

			return String(av).localeCompare(String(bv)) * dir;
		});
	}

	const openCount = rows.filter((r) => r.status === 'open').length;

	return {
		rows,
		view,
		stats: [
			{
				label: 'Total tickets',
				value: total,
				type: 'primary'
			},
			{
				label: 'Tickets ouverts',
				value: openCount,
				type: 'secondary'
			}
		]
	};
}

async function insert(row: SupportTicketRow): Promise<'not-implemented'> {
	console.log('insert', row);
	return Promise.resolve('not-implemented');
}

async function update(
	row: SupportTicketRow & { id: string }
): Promise<string> {
	console.log('update', row);
	return Promise.resolve('not-implemented');
}

export const supportTicketsModel: TableModel<
	SupportTicketRow,
	AtomicDataRes<SupportTicketRow>
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
