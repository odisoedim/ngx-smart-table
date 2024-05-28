import {defaultComparator} from './local.sorter';
import {LocalFilter} from './local.filter';
import {LocalPager} from './local.pager';
import {DataSource, IDataSourceFilter, IFilterConfig, IPagingConfig, ISortConfig} from '../data-source';
import {deepExtend} from '../../helpers';

export class LocalDataSource extends DataSource {

  protected data: Array<any> = [];
  protected filteredAndSorted: Array<any> = [];
  protected sortConf: Array<ISortConfig> = [];
  protected filterConf: IDataSourceFilter = {
    filters: [],
    andOperator: true,
  };
  protected pagingConf: IPagingConfig = {page: 1, perPage: 10};

  private selectedItems: Array<any> = [];
  constructor(data: Array<any> = []) {
    super();

    this.data = data;
  }

  load(data: Array<any>): Promise<any> {
    this.data = data;

    return super.load(data);
  }

  prepend(element: any): Promise<any> {
    this.reset(true);

    this.data.unshift(element);
    return super.prepend(element);
  }

  append(element: any): Promise<any> {
    this.reset(true);

    this.data.push(element);
    return super.append(element);
  }

  add(element: any): Promise<any> {
    this.data.push(element);

    return super.add(element);
  }

  remove(element: any): Promise<any> {
    this.data = this.data.filter(el => el !== element);

    return super.remove(element);
  }

  update(element: any, values: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(element).then((found) => {
        found = deepExtend(found, values);
        super.update(found, values).then(resolve).catch(reject);
      }).catch(reject);
    });
  }

  find(element: any): Promise<any> {
    const found = this.data.find(el => el === element);
    if (found) {
      return Promise.resolve(found);
    }

    return Promise.reject(new Error('Element was not found in the dataset'));
  }

  getElements(): Promise<any> {
    const data = this.data.slice(0);
    return Promise.resolve(this.prepareData(data));
  }

  getFilteredAndSorted(): Promise<any> {
    let data = this.data.slice(0);
    this.prepareData(data); // this would return only the current page, but it sets filteredAndSorted array
    return Promise.resolve(this.filteredAndSorted);
  }

  getAll(): Promise<any> {
    const data = this.data.slice(0);
    return Promise.resolve(data);
  }

  reset(silent = false) {
    if (silent) {
      this.filterConf = {
        filters: [],
        andOperator: true,
      };
      this.sortConf = [];
      this.pagingConf.page = 1;
    } else {
      this.setFilter([], true, false);
      this.setSort([], false);
      this.setPage(1);
    }
  }

  empty(): Promise<any> {
    this.data = [];

    return super.empty();
  }

  count(): number {
    return this.filteredAndSorted.length;
  }

  toggleItem(row: any, isSelected: boolean): void {
    if (isSelected) this.selectedItems.push(row);
    else this.selectedItems = this.selectedItems.filter((i) => i !== row);
  }

  // TODO: actually there is no need that this is an async function, but changing the signature would be a breaking change
  async selectAllItems(checked: boolean, onlyFiltered: boolean = false): Promise<void> {
    if (checked) {
      const itemsToSelect = onlyFiltered ? this.filteredAndSorted : this.data;
      this.selectedItems = itemsToSelect.slice(0);
    } else this.selectedItems = [];
  }

  isEveryElementSelected(onlyFiltered: boolean = false, reportEmptyAsFalse: boolean = false): boolean {
    const itemsToCheck = onlyFiltered ? this.filteredAndSorted : this.data;
    if (itemsToCheck.length === 0) {
      return !reportEmptyAsFalse;
    }
    if (onlyFiltered) {
      // TODO: this is an ugly and costly O(n²) check, but currently we have no other choice....
      if (itemsToCheck.length !== this.selectedItems.length) return false;
      for (const item of itemsToCheck) {
        if (this.selectedItems.indexOf(itemsToCheck) < 0) return false;
      }
      return true;
    } else {
      return itemsToCheck.length === this.selectedItems.length;
    }
  }

  getSelectedItems(): Array<any> {
    return this.selectedItems;
  }

  setSort(conf: Array<ISortConfig>, doEmit = true): LocalDataSource {
    this.sortConf = conf ?? [];
    super.setSort(conf, doEmit);
    return this;
  }

  updateSort(conf: Array<ISortConfig>, doEmit = true): LocalDataSource {
    if (conf !== null) {
      conf.forEach((fieldConf) => {
        const found = this.sortConf.findIndex(c => c.field === fieldConf.field);
        if (found >= 0) {
          if (fieldConf.compare === undefined) {
            // keep the previously configured compare function
            fieldConf.compare = this.sortConf[found].compare;
          }
          this.sortConf.splice(found, 1);
        }
        // push the updated config to the front of the array (highest sort priority)
        this.sortConf = [fieldConf, ...this.sortConf];
      });
    }
    super.setSort(conf, doEmit);
    return this;
  }

  /**
   *
   * Array of conf objects
   * [
   *  {field: string, search: string, filter: Function|null},
   * ]
   * @param conf
   * @param andOperator
   * @param doEmit
   * @returns {LocalDataSource}
   */
  setFilter(conf: Array<IFilterConfig>, andOperator = true, doEmit = true): LocalDataSource {
    if (conf && conf.length > 0) {
      conf.forEach((fieldConf) => {
        this.addFilter(fieldConf, andOperator, false);
      });
    } else {
      this.filterConf = {
        filters: [],
        andOperator: true,
      };
    }
    this.filterConf.andOperator = andOperator;
    this.pagingConf.page = 1;

    super.setFilter(conf, andOperator, doEmit);
    return this;
  }

  addFilter(fieldConf: IFilterConfig, andOperator = true, doEmit: boolean = true): LocalDataSource {
    let found = false;
    this.filterConf.filters.forEach((currentFieldConf: IFilterConfig, index: number) => {
      if (currentFieldConf.field === fieldConf.field) {
        this.filterConf.filters[index] = fieldConf;
        found = true;
      }
    });
    if (!found) {
      this.filterConf.filters.push(fieldConf);
    }
    this.filterConf.andOperator = andOperator;
    super.addFilter(fieldConf, andOperator, doEmit);
    return this;
  }

  setPaging(page: number, perPage: number, doEmit: boolean = true): LocalDataSource {
    this.pagingConf.page = page;
    this.pagingConf.perPage = perPage;

    super.setPaging(page, perPage, doEmit);
    return this;
  }

  setPage(page: number, doEmit: boolean = true): LocalDataSource {
    this.pagingConf.page = page;
    super.setPage(page, doEmit);
    return this;
  }

  getSort(): Array<ISortConfig> {
    return this.sortConf;
  }

  getFilter(): IDataSourceFilter {
    return this.filterConf;
  }

  getPaging(): IPagingConfig {
    return this.pagingConf;
  }

  protected prepareData(data: Array<any>): Array<any> {
    data = this.filter(data);
    data = this.sort(data);
    this.filteredAndSorted = data.slice(0);

    return this.paginate(data);
  }

  protected sort(data: Array<any>): Array<any> {
    // only use the part of the config where sorting is enabled
    const sortConfig = this.sortConf.filter(c => c.direction !== null);

    return data.sort((a, b) => {
      for (const sc of sortConfig) {
        const dir: number = (sc.direction === 'asc') ? 1 : -1;
        const compare: Function = sc.compare ? sc.compare : defaultComparator;
        let parts = sc.field.split(".");
        let propA = a;
        for (let i = 0; i < parts.length && typeof propA !== 'undefined'; i++) {
          propA = propA[parts[i]];
        }
        let propB = b;
        for (let i = 0; i < parts.length && typeof propB !== 'undefined'; i++) {
          propB = propB[parts[i]];
        }
        const result = compare.call(null, dir, propA, propB);
        if (result !== 0) return result;
      }
      return 0;
    });
  }

  // TODO: refactor?
  protected filter(data: Array<any>): Array<any> {
    if (this.filterConf.filters) {
      if (this.filterConf.andOperator) {
        this.filterConf.filters.forEach(fieldConf => {
          if (fieldConf.search.length > 0) {
            data = LocalFilter.filter(data, fieldConf);
          }
        });
      } else {
        let mergedData: any = [];
        this.filterConf.filters.forEach((fieldConf: any) => {
          if (fieldConf['search'].length > 0) {
            mergedData = mergedData.concat(LocalFilter.filter(data, fieldConf));
          }
        });
        // remove non unique items
        data = mergedData.filter((elem: any, pos: any, arr: any) => {
          return arr.indexOf(elem) === pos;
        });
      }
    }
    return data;
  }

  protected paginate(data: Array<any>): Array<any> {
    return LocalPager.paginate(data, this.pagingConf.page, this.pagingConf.perPage);
  }
}
