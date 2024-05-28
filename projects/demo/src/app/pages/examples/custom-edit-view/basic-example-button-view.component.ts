import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ViewCell, IColumnType } from 'angular2-smart-table';

@Component({
  selector: 'button-view',
  template: `
    <button (click)="onClick()">{{ renderValue }}</button>
  `,
})
export class ButtonViewComponent implements ViewCell, OnInit {
  renderValue!: string;

  @Input() value!: string | number;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.renderValue = this.value.toString().toUpperCase();
  }

  onClick() {
    this.save.emit(this.rowData);
  }
}



@Component({
  selector: 'basic-example-button-view',
  template: `
    <angular2-smart-table [settings]="settings" [source]="data"></angular2-smart-table>
  `,
})
export class BasicExampleButtonViewComponent implements OnInit {

  settings = {
    columns: {
      id: {
        title: 'ID',
        type: IColumnType.Text,
      },
      name: {
        title: 'Full Name',
        type: IColumnType.Text,
      },
      username: {
        title: 'User Name',
        type: IColumnType.Text,
      },
      email: {
        title: 'Email',
        type: IColumnType.Text,
      },
      button: {
        title: 'Button',
        type: IColumnType.Custom,
        renderComponent: ButtonViewComponent,
        onComponentInitFunction(instance: any) {
          instance.save.subscribe((row: any) => {
            alert(`${row.name} saved!`)
          });
        }
      },
    },
  };

  data = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      button: 'Button #1',
    },
    {
      id: 2,
      name: 'Ervin Howell',
      username: 'Antonette',
      email: 'Shanna@melissa.tv',
      button: 'Button #2',
    },
    {
      id: 3,
      name: 'Clementine Bauch',
      username: 'Samantha',
      email: 'Nathan@yesenia.net',
      button: 'Button #3',
    },
    {
      id: 4,
      name: 'Patricia Lebsack',
      username: 'Karianne',
      email: 'Julianne.OConner@kory.org',
      button: 'Button #4',
    },
    {
      id: 5,
      name: 'Chelsey Dietrich',
      username: 'Kamren',
      email: 'Lucio_Hettinger@annie.ca',
      button: 'Button #5',
    },
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
