import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { TableModel, UntypedRow, DataRes, AtomicDataRes, View, PagedDataRes, PageCache, TableStat } from './tableModel';

export class TableView<Row extends UntypedRow = UntypedRow, Res extends DataRes<Row> = DataRes<Row>> {
	model: TableModel<Row, Res>
	view: Ref<View>
	cache: Record<string /* view key */, Res extends AtomicDataRes<Row> ? Res : PageCache<Row>>
	backView: View | null = null
	data: Ref<Row[]> = ref([])
	loading: Ref<boolean> = ref(false)
	error: Ref<string | null> = ref(null)
	updating: Ref<boolean> = ref(false)
	total: Ref<number> = ref(0)
	pageSize: Ref<number> = ref(10)
	currentPage: Ref<number> = ref(0)
	scrollLoading: Ref<boolean> = ref(false)
	allData: Ref<Row[]> = ref([])
	stats: Ref<TableStat[] | undefined> = ref(undefined);

	// for updating cells
	updatingCells: Ref<Record<string, Set<string>>> = ref({})
	cellErrors: Ref<Record<string, Set<string>>> = ref({})
	knownValues: Ref<Record<string, Record<string, unknown>>> = ref({}) // for each row, we store the known values
	targetValues: Ref<Record<string, Record<string, unknown>>> = ref({}) // for each row, we store the target values


	constructor(model: TableModel<Row, Res>, initialView: View){
		this.model = model;
		this.view = ref(initialView);
		this.cache = {};
		watch(this.view, () => {
			this.refreshData();
		}, { deep: true, immediate: true })
	}

	private isAtomicDataRes<Row extends UntypedRow>(res: DataRes<Row>): res is AtomicDataRes<Row> {
		return 'rows' in res && Array.isArray(res.rows);
	}
	private isPagedDataRes<Row extends UntypedRow>(res: DataRes<Row>): res is PagedDataRes<Row> {
		return 'total' in res && typeof res.total === 'number' && typeof res.getRange === 'function';
	}

	public async refreshData(scroll: boolean = false) {
		const isFirstLoad = this.backView === null;
		if(scroll){
			this.scrollLoading.value = true;
		}
		else if(isFirstLoad){
			this.loading.value = true;
		}else{
			this.updating.value = true;
			this.currentPage.value = 0;
		}
		this.error.value = null;

		try{

			const res = await this.model.getData(this.view.value);
			if(this.isAtomicDataRes(res)){
				this.data.value = res.rows;
				this.backView = res.view;
			}else if(this.isPagedDataRes(res)){
				this.total.value = res.total;
				this.pageSize.value = res.pageSize ?? this.pageSize.value;
				const start = this.currentPage.value * this.pageSize.value;
				const end = start + this.pageSize.value;
				const pageRows = await res.getRange(start, end);
				if(this.currentPage.value === 0){
					this.data.value = pageRows;
				}else{
					this.data.value = [...this.data.value, ...pageRows];
				}
				this.backView = res.view;
			}
			this.stats.value = res.stats;
		}catch(err){
			console.error(err);
			this.error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
			return;
		}
		finally{
			this.loading.value = false;
			this.updating.value = false;
			if(scroll){
				this.scrollLoading.value = false;
			}
		}
	}

	public async updateCell(id: string, key: string, targetValue: unknown){

		const knownValue = this.knownValues.value[id]?.[key] ?? this.data.value.find(r => r._id === id)?.[key];
		if(this.updatingCells.value[id]?.has(key) || knownValue === targetValue) return;

		this.targetValues.value[id] = this.targetValues.value[id] || {};
		this.targetValues.value[id][key] = targetValue;

		this.updatingCells.value[id] = this.updatingCells.value[id] || new Set();
		this.updatingCells.value[id].add(key);

		try{
			await this.model.update({ ...this.data.value.find(r => r._id === id), [key]: targetValue } as Row & { id: string });
			this.knownValues.value[id] = this.knownValues.value[id] || {};
			this.knownValues.value[id][key] = targetValue;
		}catch(e){
			this.cellErrors.value[id] = this.cellErrors.value[id] || new Set();
			this.cellErrors.value[id].add(key);
			setTimeout(() => {
				if(this.cellErrors.value[id]) this.cellErrors.value[id].delete(key);
			}, 5000);
			throw e;
		}finally{
			delete this.targetValues.value[id]?.[key];
			this.updatingCells.value[id]?.delete(key);
		}


		/* const row = this.data.value.find(r => r.id === id);
		let knownValue = row?.[key];
		console.log('targetValue', targetValue);
		console.log('knownValue', knownValue);

		if(knownValue === targetValue) return 'error';

		if(!this.updatingCells.value[id]) this.updatingCells.value[id] = new Set();
		this.updatingCells.value[id].add(key);
		if(this.cellErrors.value[id]) this.cellErrors.value[id].delete(key);

		console.log('updatingCells', this.updatingCells.value);
		console.log('cellErrors', this.cellErrors.value);

		try{
			console.log('update', { ...row, [key]: targetValue } as Row & { id: string });
			await this.model.update({ ...row, [key]: targetValue } as Row & { id: string });
			console.log('success');
		}catch(e){
			if(row){
				row[key as keyof Row] = knownValue as Row[keyof Row];
			}
			if(!this.cellErrors.value[id]) this.cellErrors.value[id] = new Set();
			this.cellErrors.value[id].add(key);
			setTimeout(() => {
				if(this.cellErrors.value[id]) this.cellErrors.value[id].delete(key);
			}, 5000);
			console.log('error', e);
		}finally{
			this.updatingCells.value[id].delete(key);
		} */
	}
	setView(view: View){
		this.view.value = view;
	}
}