import { Component } from '@angular/core';

import { CustomEditorComponent } from './custom-editor.component';
import { CustomRenderComponent } from './custom-render.component';
import { CustomFilterComponent } from './custom-filter.component';
import { IColumnType } from 'projects/angular2-smart-table/src/public-api';

@Component({
  selector: 'advanced-example-custom-editor',
  template: `
    <angular2-smart-table [settings]="settings" [source]="data"></angular2-smart-table>
  `,
})
export class AdvancedExamplesCustomEditorComponent {

  data = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      link: '<a href="http://www.google.com">Google</a>',
    },
    {
      id: 2,
      name: 'Ervin Howell',
      username: 'Antonette',
      link: '<a href="http://www.google.com">Google</a>',
    },
    {
      id: 3,
      name: 'Clementine Bauch',
      username: 'Samantha',
      link: '<a href="https://github.com/dj-fiorex/angular2-smart-table">Angular2 smart table</a>',
    },
    {
      id: 4,
      name: 'Patricia Lebsack',
      username: 'Karianne',
      link: '<a href="http://www.google.com">Google</a>',
    },
  ];

  settings = {
    columns: {
      id: {
        title: 'ID',
        type: IColumnType.Text,
        filter: {
          type: 'custom',
          component: CustomFilterComponent
        }
      },
      name: {
        title: 'Full Name',
        type: IColumnType.Custom,
        renderComponent: CustomRenderComponent,
      },
      username: {
        title: 'User Name',
        type: IColumnType.Text,
      },
      link: {
        title: 'Link',
        type: IColumnType.Html,
        editor: {
          type: 'custom',
          component: CustomEditorComponent,
        },
      },
    },
  };
}
