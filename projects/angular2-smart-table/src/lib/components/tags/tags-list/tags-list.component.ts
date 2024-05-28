import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'angular2-smart-table-tags-list',
    styleUrls: ['./tags-list.component.scss'],
    templateUrl: './tags-list.component.html',
})
export class TagsListComponent {

    @Input() tags!: any[];

    @Output() close = new EventEmitter<any>();

    closedTag(tag: any) {
        this.close.emit(tag);
    }
}
