import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Ng2CompleterModule} from 'ng2-completer';

import {FilterComponent} from './filter.component';
import {DefaultFilterComponent} from "./default-filter.component";
import {CustomFilterComponent} from "./custom-filter.component";
import {CheckboxFilterComponent} from './filter-types/checkbox-filter.component';
import {CompleterFilterComponent} from './filter-types/completer-filter.component';
import {InputFilterComponent} from './filter-types/input-filter.component';
import {SelectFilterComponent} from './filter-types/select-filter.component';
import {DefaultFilter} from './filter-types/default-filter';
import {FilterDefault} from './filter-default';
import {DateFilterComponent} from './filter-types/date-filter.component';
import {MselectFilterComponent} from './filter-types/mselect-filter.component';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown';

const FILTER_COMPONENTS = [
  FilterDefault,
  DefaultFilter,
  FilterComponent,
  DateFilterComponent,
  DefaultFilterComponent,
  CustomFilterComponent,
  CheckboxFilterComponent,
  CompleterFilterComponent,
  InputFilterComponent,
  SelectFilterComponent,
  MselectFilterComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2CompleterModule,
    AngularMultiSelectModule
  ],
  declarations: [
    ...FILTER_COMPONENTS,
  ],
  exports: [
    ...FILTER_COMPONENTS,
  ],
})
export class FilterModule { }
