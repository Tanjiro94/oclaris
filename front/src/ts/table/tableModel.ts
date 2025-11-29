export type Columns = 'text' | 'number' | 'date' | 'toggle' | 'select' | 'checkbox' | 'action' | 'tag' | 'color' | 'tag-values';
export type Align = 'left' | 'center' | 'right';
export type ActionGlobalType = 'primary' | 'secondary' | 'danger';
export type FilterExpression = 'eq' | 'lt' | 'gt' | 'contains';

export interface ColDef {
	id: number;
	label: string;
	key: string;
	type: Columns;
	icon?: string;
	options?: string[] | { label: string; value: string; disabled?: boolean}[];
	show?: boolean;
	sortable?: { key: string, options: { label: string; value: 'asc' | 'desc'; }[] } | false;
	filterable?: { key: string, options: { label: string; value: string; expression: FilterExpression; }[] } | false;
	groupable?: { key: string, options: { label: string; icon?: string; value: string; statValue?: string | number }[], defaultTabId?: string, type?: 'primary' | 'secondary' | 'important' } | false; /* option =  onglet, key = champ de groupage */
	searchable?: boolean;
	align?: Align;
	className?: string;
	async?: boolean;
	loading?: boolean;
	error?: boolean;
	editable?: boolean;
	size? : 'xs' | 's' | 'm' | 'l' | 'xl' | 'custom';
	customSize?: string;
	tooltip?: string;
	onlyIcon?: boolean;
	coloredCol?: boolean;
	coloredColValue?: string;
}
export type RowWithId = UntypedRow & { _id?: string | number; id?: string | number };

interface Action {
	label: string | ((row: UntypedRow) => string);
	icon: string;
	color?: string; // remove ?
	className?: string;
}

export type UntypedRow = Record<string /* column id */, unknown | Promise<unknown> /* support long-loading cells */>

export interface GlobalAction extends Action {
	type: ActionGlobalType;
	execute?: (() => void) | (() => Promise<void>);
	// TODO: disabled?
}

export interface RowAction<Row extends UntypedRow> extends Action {
	execute?: ((row: Row) => void) | ((row: Row) => Promise<void>);
	disabled?: boolean; // TODO: depend on row
}

export interface TableStat {
	label: string;
	icon?: string;
	value: string | number;
	type?: 'primary' | 'secondary' | 'important';
}

export interface View {
	//limit?: number
	sort?: {
		field: string
		order: 'asc' | 'desc'
	}
	filters?: Record<string, {expression: FilterExpression; value: string | number | boolean}>
	columns?: string[]
	groupBy?: {
		field: string
		value: string | number | boolean | null
	}
}
/* function viewKey(view: View): string {
	// TODO
	const { sort, filters, columns } = view;
	return JSON.stringify({ sort : sort || null, filters : filters || {}, columns: columns || [] });
} */

export interface DataRes_ { view: View, stats?: TableStat[] }
export interface AtomicDataRes<Row extends UntypedRow> extends DataRes_ { rows: Row[] }
export interface PagedDataRes<Row extends UntypedRow> extends DataRes_ {
	total: number
	pageSize?: number
	getRange(start: number, end: number): Promise<Row[]>
}
export interface PageCache<Row extends UntypedRow> {
	total: number
	pages: Array<{ start: number, end: number, row: Row[] }>
}

export type DataRes<Row extends UntypedRow> = AtomicDataRes<Row> | PagedDataRes<Row>

export interface TableModel<Row extends UntypedRow, Res extends DataRes<Row>> {
	columns: ColDef[]
	getData: (view: View) => Res | Promise<Res>
	rowActions: RowAction<Row>[]
	globalActions: GlobalAction[]
	selectable?: boolean
	readonly?: boolean
	insert(row: Row) : Promise<string /* insert row id */>
	update(row: Row & { id: string }) : Promise<string /* error */> /*  partial update are supported */
}

