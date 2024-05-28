import {Component, OnInit} from '@angular/core';
import {CompleterService} from 'ng2-completer';

import {DefaultEditor} from './default-editor';

@Component({
  selector: 'completer-editor',
  template: `
    <ng2-completer [(ngModel)]="completerStr"
                   [dataService]="completerConfig.dataService"
                   [minSearchLength]="completerConfig.minSearchLength || 0"
                   [pause]="completerConfig.pause || 0"
                   [placeholder]="completerConfig.placeholder || 'Start typing...'"
                   (selected)="onEditedCompleter($event)">
    </ng2-completer>
    `,
})
export class CompleterEditorComponent extends DefaultEditor implements OnInit {

  completerConfig: any; // TODO: we need a proper type for this
  completerStr: string = '';

  constructor(private completerService: CompleterService) {
    super();
  }

  ngOnInit() {
    this.completerStr = this.cell.getRawValue(); // initialize with current value
    const config = this.completerConfig = this.cell.getColumn().getConfig().completer;
    config.dataService = this.completerService.local(config.data, config.searchFields, config.titleField);
    config.dataService.descriptionField(config.descriptionField);
  }

  onEditedCompleter(event: any): boolean {
    this.cell.newValue = event.title;
    return false;
  }
}
