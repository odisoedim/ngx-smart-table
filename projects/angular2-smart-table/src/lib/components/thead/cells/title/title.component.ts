import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';

import {DataSource} from '../../../../lib/data-source/data-source';
import {Column} from '../../../../lib/data-set/column';

@Component({
  selector: 'angular2-smart-table-title',
  styleUrls: ['./title.component.scss'],
  template: `
    <a href="#" *ngIf="column.isSortable"
       (click)="_sort($event)"
       class="angular2-smart-sort-link sort"
       [ngClass]="currentDirection??''">
      {{ column.title }}
    </a>
    <span class="angular2-smart-sort" *ngIf="!column.isSortable">{{ column.title }}</span>
    <button style="position: absolute; top:0; right:0; border:none" *ngIf="isHideable"
            (click)="_hideColumnClicked($event)">X
    </button>
  `,
})
export class TitleComponent implements OnChanges {

  currentDirection: 'asc'|'desc'|null = null;
  @Input() column!: Column;
  @Input() source!: DataSource;
  @Input() isHideable!: boolean;
  @Output() hide = new EventEmitter<any>();

  protected dataChangedSub!: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.source) {
      if (!changes.source.firstChange) {
        this.dataChangedSub.unsubscribe();
      }
      this.dataChangedSub = this.source.onChanged().subscribe((dataChanges) => {
        this.currentDirection = null;
        const sortConf = this.source.getSort();
      
        if (sortConf.length > 0 && sortConf[0]['field'] === this.column.id) {
          this.currentDirection = sortConf[0]['direction'];
        } else {
          this.currentDirection = null;
        }
        if (sortConf) {
          sortConf.forEach(c => {
            if (c.field === this.column.id) {
              this.currentDirection = c.direction;
            }
          });
        }
      });
    }
  }

  _sort(event: any) {
    event.preventDefault();
    this.changeSortDirection();
    this.source.updateSort([
      {
        field: this.column.id,
        direction: this.currentDirection,
        compare: this.column.getCompareFunction(),
      },
    ]);
    this.hide.emit(null);
  
  }


  _hideColumnClicked(event: any) {
    event.preventDefault();
    this.hide.emit(this.column.id);
  }


  changeSortDirection(): any {
    if (this.currentDirection) {
      const newDirection = this.currentDirection === 'asc' ? 'desc' : 'asc';
      this.currentDirection = newDirection;
    } else {
      this.currentDirection = this.column.sortDirection;
    }
    
  }
}
