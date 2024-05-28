import {Component, Input} from '@angular/core';

import {Column} from '../../lib/data-set/column';
import {DataSource} from '../../lib/data-source/data-source';

@Component({
  template: '',
})
export class FilterDefault {

  @Input() column!: Column;
  @Input() source!: DataSource;
  @Input() inputClass: string = '';

  query: string = '';

  onFilter(query: string) {
    this.source.addFilter({
      field: this.column.id,
      search: query,
      filter: this.column.getFilterFunction(),
    });
  }
}
