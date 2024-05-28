import {Component, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef,} from '@angular/core';

import {Cell} from '../../../lib/data-set/cell';
import {ViewCell} from './view-cell';

@Component({
  selector: 'custom-view-component',
  template: `
    <ng-template #dynamicTarget></ng-template>
  `,
})
export class CustomViewComponent implements OnInit, OnDestroy {

  customComponent: any;
  @Input() cell!: Cell;
  @ViewChild('dynamicTarget', { read: ViewContainerRef, static: true }) dynamicTarget!: ViewContainerRef;

  ngOnInit() {
    if (this.cell && !this.customComponent) {
      this.customComponent = this.dynamicTarget.createComponent(this.cell.getColumn().renderComponent);
      Object.assign(this.customComponent.instance, this.getPatch());
      const onComponentInitFunction = this.cell.getColumn().getOnComponentInitFunction();
      onComponentInitFunction && onComponentInitFunction(this.customComponent.instance, this.getPatch());
    }
  }

  ngOnDestroy() {
    this.customComponent.destroy();
  }

  protected getPatch(): ViewCell {
    return {
      value: this.cell.getValue(),
      rowData: this.cell.getRow().getData()
    }
  }
}
