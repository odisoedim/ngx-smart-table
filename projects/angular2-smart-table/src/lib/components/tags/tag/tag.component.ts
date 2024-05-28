import {Component, EventEmitter, Input, Output} from '@angular/core';


@Component({
    selector: 'angular2-smart-table-tag',
    styleUrls: ['./tag.component.scss'],
    templateUrl: './tag.component.html',
})
export class TagComponent {

    @Input() item!: any;

    @Output() close = new EventEmitter<any>();

    closeClicked(evt: Event) {
        evt.stopPropagation();
        this.close.emit(this.item.id);
    }
}
