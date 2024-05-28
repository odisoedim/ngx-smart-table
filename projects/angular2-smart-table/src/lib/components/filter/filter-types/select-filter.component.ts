import {Component, OnInit, ViewChild} from '@angular/core';
import {NgControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, skip} from 'rxjs/operators';

import {DefaultFilter} from './default-filter';
import {defaultStringEqualsFilter, defaultStringInclusionFilter} from "../../../lib/data-source/local/local.filter";

@Component({
  selector: 'select-filter',
  template: `
    <select [ngClass]="inputClass"
            class="form-control"
            #inputControl
            [(ngModel)]="query">

        <option value="">{{ column.getFilterConfig().selectText }}</option>
        <option *ngFor="let option of column.getFilterConfig().list" [value]="option.value">
          {{ option.title }}
        </option>
    </select>
  `,
})
export class SelectFilterComponent extends DefaultFilter implements OnInit {

  @ViewChild('inputControl', { read: NgControl, static: true }) inputControl!: NgControl;

  ngOnInit() {
    this.column.filterFunction = this.onFilterValues.bind(this);

    const exist = this.inputControl.valueChanges;
    if (!exist) {
      return;
    }
    exist
      .pipe(
        skip(1),
        distinctUntilChanged(),
        debounceTime(this.delay)
      )
      .subscribe((value: string) => this.setFilter());
  }

  onFilterValues(cellValue: string, search: string, data: any, cellName: string) {
    const strictFilter = this.column.getFilterConfig()?.strict ?? false;
    if (strictFilter) {
      return defaultStringEqualsFilter(cellValue, search, data, cellName);
    } else {
      return defaultStringInclusionFilter(cellValue, search, data, cellName);
    }
  }
}
