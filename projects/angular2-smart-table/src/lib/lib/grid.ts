import {Observable, Subject, Subscription} from 'rxjs';

import {Deferred, getDeepFromObject, getPageForRowIndex} from './helpers';
import {Column} from './data-set/column';
import {Row} from './data-set/row';
import {DataSet} from './data-set/data-set';
import {DataSource, DataSourceChangeEvent} from './data-source/data-source';
import {EventEmitter, Type} from '@angular/core';

import {Settings} from "./settings";
import {CreateConfirmEvent, DeleteConfirmEvent, EditConfirmEvent} from './events';

export class Grid {

  createFormShown: boolean = false;

  source!: DataSource;
  settings!: Settings;
  dataSet!: DataSet;

  onSelectRowSource = new Subject<any>();

  private sourceOnChangedSubscription!: Subscription;
  private sourceOnUpdatedSubscription!: Subscription;

  constructor(source: DataSource, settings: any) {
    this.setSettings(settings);
    this.setSource(source);
  }


  detach(): void {
    if (this.sourceOnChangedSubscription) {
      this.sourceOnChangedSubscription.unsubscribe();
    }
    if (this.sourceOnUpdatedSubscription) {
      this.sourceOnUpdatedSubscription.unsubscribe();
    }
  }

  showActionColumn(position: string): boolean {
    return this.isCurrentActionsPosition(position) && this.isActionsVisible();
  }

  isCurrentActionsPosition(position: string): boolean {
    return position == this.getSetting('actions.position');
  }

  isActionsVisible(): boolean {
    if (this.settings.actions === false || this.settings.actions === undefined) {
      return false;
    }
    return this.settings.actions.add || this.settings.actions.edit || this.settings.actions.delete ||
      (this.settings.actions.custom?.length ?? 0) > 0 ||
      this.getExpandedRowComponentClass() !== undefined;
  }

  isMultiSelectVisible(): boolean {
    return ['multi', 'multi_filtered'].indexOf(this.getSetting('selectMode')) > -1;
  }

  getExpandedRowComponentClass(): Type<any> | undefined {
    return this.settings.expand?.component ?? this.settings.expandedRowComponent;
  }

  getNewRow(): Row {
    return this.dataSet.newRow;
  }

  setSettings(settings: Settings) {
    this.settings = settings;
    this.dataSet = new DataSet([], this.getSetting('columns'));

    if (this.source) {
      this.source.refresh();
    }
  }

  getDataSet(): DataSet {
    return this.dataSet;
  }

  setSource(source: DataSource) {
    this.detach();
    this.source = this.prepareSource(source);

    this.sourceOnChangedSubscription = this.source.onChanged().subscribe((changes: any) => this.processDataChange(changes));

    this.sourceOnUpdatedSubscription = this.source.onUpdated().subscribe((data: any) => {
      const changedRow = this.dataSet.findRowByData(data);
      changedRow.setData(data);
    });
  }

  getSetting(name: string, defaultValue?: any): any {
    return getDeepFromObject(this.settings, name, defaultValue);
  }

  getColumns(): Array<Column> {
    return this.dataSet.getColumns();
  }

  getRows(): Array<Row> {
    return this.dataSet.getRows();
  }

  selectRow(row: Row) {
    this.dataSet.selectRow(row);
    this.source.toggleItem(row.getData(), row.isSelected);
  }

  multipleSelectRow(row: Row) {
    this.dataSet.multipleSelectRow(row);
    this.source.toggleItem(row.getData(), row.isSelected);
  }

  onSelectRow(): Observable<any> {
    return this.onSelectRowSource.asObservable();
  }

  expandRow(row: Row) {
    this.dataSet.expandRow(row);
  }

  edit(row: Row) {
    row.isInEditing = true;
  }

  create(row: Row, confirmEmitter: EventEmitter<CreateConfirmEvent>) {

    const deferred = new Deferred();
    deferred.promise.then((newData) => {
      newData = newData ? newData : row.getNewData();
      if (deferred.resolve.skipAdd) {
        this.createFormShown = false;
      } else {
        this.source.prepend(newData).then(() => {
          this.createFormShown = false;
          this.dataSet.createNewRow();
        });
      }
    }).catch((err) => {
      // doing nothing
    });

    if (this.getSetting('add.confirmCreate')) {
      confirmEmitter.emit({
        newData: row.getNewData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  save(row: Row, confirmEmitter: EventEmitter<EditConfirmEvent>) {

    const deferred = new Deferred();
    deferred.promise.then((newData) => {
      newData = newData ? newData : row.getNewData();
      if (deferred.resolve.skipEdit) {
        row.isInEditing = false;
      } else {
        this.source.update(row.getData(), newData).then(() => {
          row.isInEditing = false;
        });
      }
    }).catch((err) => {
      // doing nothing
    });

    if (this.getSetting('edit.confirmSave')) {
      confirmEmitter.emit({
        row: row,
        data: row.getData(),
        newData: row.getNewData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  delete(row: Row, confirmEmitter: EventEmitter<DeleteConfirmEvent>) {

    const deferred = new Deferred();
    deferred.promise.then(() => {
      this.source.remove(row.getData());
    }).catch((err) => {
      // doing nothing
    });

    if (this.getSetting('delete.confirmDelete')) {
      confirmEmitter.emit({
        row: row,
        data: row.getData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  processDataChange(changes: DataSourceChangeEvent) {
    if (this.shouldProcessChange(changes)) {
      this.dataSet.setData(changes.elements, this.getSelectedItems());
      if (this.getSetting('selectMode') === 'single') {
        if (this.dataSet.getRows().length > 0) {
          const row = this.determineRowToSelect(changes);
          this.onSelectRowSource.next(row);
        } else {
          this.onSelectRowSource.next(null);
        }
      }
    }
  }

  shouldProcessChange(changes: DataSourceChangeEvent): boolean {
    if (['filter', 'sort', 'page', 'remove', 'refresh', 'load', 'empty', 'paging'].indexOf(changes.action) !== -1) {
      return true;
    } else if (['prepend', 'append'].indexOf(changes.action) !== -1 && !this.getSetting('pager.display')) {
      return true;
    }

    return false;
  }

  /**
   * @breaking-change 1.8.0
   * Need to add `| null` in return type
   *
   * TODO: move to selectable? Separate directive
   */
  determineRowToSelect(changes: DataSourceChangeEvent): Row | null {

    if (['load', 'page', 'filter', 'sort', 'refresh'].indexOf(changes.action) !== -1) {
      return this.dataSet.select(this.getRowIndexToSelect());
    }

    if (this.shouldSkipSelection()) {
      return null;
    }

    if (changes.action === 'remove') {
      if (changes.elements.length === 0) {
        // we have to store which one to select as the data will be reloaded
        this.dataSet.willSelectLastRow();
      } else {
        return this.dataSet.selectPreviousRow();
      }
    }
    if (changes.action === 'append') {
      // we have to store which one to select as the data will be reloaded
      this.dataSet.willSelectLastRow();
    }
    if (changes.action === 'add') {
      return this.dataSet.selectFirstRow();
    }
    if (changes.action === 'update') {
      return this.dataSet.selectFirstRow();
    }
    if (changes.action === 'prepend') {
      // we have to store which one to select as the data will be reloaded
      this.dataSet.willSelectFirstRow();
    }
    return null;
  }

  prepareSource(source: any): DataSource {
    const initialSource: any = this.getInitialSort();
    if (initialSource && initialSource['field'] && initialSource['direction']) {
      source.setSort([initialSource], false);
    }
    source.setPaging(this.getPageToSelect(source), this.getSetting('pager.perPage'), false);

    source.refresh();
    return source;
  }

  getInitialSort() {
    const sortConf: any = {};
    this.getColumns().forEach((column: Column) => {
      if (column.isSortable && column.defaultSortDirection) {
        sortConf['field'] = column.id;
        sortConf['direction'] = column.defaultSortDirection;
        sortConf['compare'] = column.getCompareFunction();
      }
    });
    return sortConf;
  }

  getSelectedRows(): Array<any> {
    return this.dataSet.getRows()
      .filter(r => r.isSelected);
  }

  getSelectedItems(): Array<any> {
    return this.source.getSelectedItems();
  }

  async selectAllRows(status: boolean) {
    // remember that the data set of the grid only contains the visible elements on the current page
    this.dataSet.getRows().forEach(r => r.isSelected = status);

    // advise the data source to also update the selected elements
    await this.source.selectAllItems(status, this.getSetting('selectMode') === 'multi_filtered');
  }

  getFirstRow(): Row {
    return this.dataSet.getFirstRow();
  }

  getLastRow(): Row {
    return this.dataSet.getLastRow();
  }

  private getSelectionInfo(): { perPage: number, page: number, selectedRowIndex: number, switchPageToSelectedRowPage: boolean } {
    const switchPageToSelectedRowPage: boolean = this.getSetting('switchPageToSelectedRowPage');
    const selectedRowIndex: number = Number(this.getSetting('selectedRowIndex', 0)) || 0;
    const {perPage, page}: { perPage: number, page: number } = this.getSetting('pager');
    return {perPage, page, selectedRowIndex, switchPageToSelectedRowPage};
  }

  private getRowIndexToSelect(): number {
    const {switchPageToSelectedRowPage, selectedRowIndex, perPage} = this.getSelectionInfo();
    const dataAmount: number = this.source.count();
    /**
     * source - contains all table data
     * dataSet - contains data for current page
     * selectedRowIndex - contains index for data in all data
     *
     * because of that, we need to count index for a specific row in page
     * if
     * `switchPageToSelectedRowPage` - we need to change page automatically
     * `selectedRowIndex < dataAmount && selectedRowIndex >= 0` - index points to existing data
     * (if index points to non-existing data and we calculate index for current page - we will get wrong selected row.
     *  if we return index witch not points to existing data - no line will be highlighted)
     */
    return (
      switchPageToSelectedRowPage &&
      selectedRowIndex < dataAmount &&
      selectedRowIndex >= 0
    ) ?
      selectedRowIndex % perPage :
      selectedRowIndex;
  }

  private getPageToSelect(source: DataSource): number {
    const {switchPageToSelectedRowPage, selectedRowIndex, perPage, page} = this.getSelectionInfo();
    let pageToSelect: number = Math.max(1, page);
    if (switchPageToSelectedRowPage && selectedRowIndex >= 0) {
      pageToSelect = getPageForRowIndex(selectedRowIndex, perPage);
    }
    const maxPageAmount: number = Math.ceil(source.count() / perPage);
    return maxPageAmount ? Math.min(pageToSelect, maxPageAmount) : pageToSelect;
  }

  private shouldSkipSelection(): boolean {
    /**
     * For backward compatibility when using `selectedRowIndex` with non-number values - ignored.
     *
     * Therefore, in order to select a row after some changes,
     * the `selectedRowIndex` value must be invalid or >= 0 (< 0 means that no row is selected).
     *
     * `Number(value)` returns `NaN` on all invalid cases, and comparisons with `NaN` always return `false`.
     *
     * !!! We should skip a row only in cases when `selectedRowIndex` < 0
     * because when < 0 all lines must be deselected
     */
    const selectedRowIndex = Number(this.getSetting('selectedRowIndex'));
    return selectedRowIndex < 0;
  }
}
