import {Component} from '@angular/core';

import {DefaultEditor} from './default-editor';

@Component({
  selector: 'select-editor',
  template: `
    <select [ngClass]="inputClass"
            class="form-control"
            [value]="cell.newValue"
            (change)="onSelectionChanged($any($event.target).value)"
            [name]="cell.getId()"
            [disabled]="!cell.isEditable()"
            (click)="onClick.emit($event)"
            [multiple]="cell.getColumn().getConfig()?.multiple">
            (keydown.enter)="disableEnterKeySave || onEdited.emit($event)"
            (keydown.esc)="onStopEditing.emit()">

        <option *ngFor="let option of cell.getColumn().getConfig()?.list" [value]="option.value"
                [selected]="option.value === cell.getRawValue()">{{ option.title }}
        </option>
    </select>
    `,
})
export class SelectEditorComponent extends DefaultEditor {

  constructor() {
    super();
  }

  onSelectionChanged(newValue: string) {
    this.cell.newValue = newValue;
  }
}
