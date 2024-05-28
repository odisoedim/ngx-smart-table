import { Component } from '@angular/core';

@Component({
  selector: 'advanced-example-filters',
  template: `
    <angular2-smart-table [settings]="settings" [source]="data"></angular2-smart-table>
  `,
})
export class AdvancedExampleFiltersComponent {

  data = [
    {
      id: 4,
      name: 'Patricia Lebsack',
      email: 'Julianne.OConner@kory.org',
      passed: 'Yes',
    },
    {
      id: 5,
      name: 'Chelsey Dietrich',
      email: 'Lucio_Hettinger@annie.ca',
      passed: 'No',
    },
    {
      id: 6,
      name: 'Mrs. Dennis Schulist',
      email: 'Karley_Dach@jasper.info',
      passed: 'Yes',
    },
    {
      id: 7,
      name: 'Kurtis Weissnat',
      email: 'Telly.Hoeger@billy.biz',
      passed: 'No',
    },
    {
      id: 8,
      name: 'Nicholas Runolfsdottir V',
      email: 'Sherwood@rosamond.me',
      passed: 'Yes',
    },
    {
      id: 9,
      name: 'Glenna Reichert',
      email: 'Chaim_McDermott@dana.io',
      passed: 'No',
    },
    {
      id: 10,
      name: 'Clementina DuBuque',
      email: 'Rey.Padberg@karina.biz',
      passed: 'No',
    },
    {
      id: 11,
      name: 'Nicholas DuBuque',
      email: 'Rey.Padberg@rosamond.biz',
      passed: 'Yes',
    },
    {
      id: 12,
      name: 'Chelsey Dietrichdottir',
      email: 'Lucio_Hettinger@annie.ca',
      passed: 'No',
    },
  ];

  settings = {
    columns: {
      id: {
        title: 'ID',
        placeholder: 'Prueba',
      },
      name: {
        title: 'Full Name',
        filter: {
          type: 'multiple',
          config: {
            strict: true, // default is false and will work like a case-insensitive text search
            selectedItems: [],
            dropdownSettings: {
              singleSelection: false,
              text: "Select",
              selectAllText: "Select All",
              unSelectAllText: 'UnSelect All',
              enableSearchFilter: true,
              classes: ""
            },
            dropdownList: [
              { id: 'Glenna Reichert', itemName: 'Glenna Reichert' },
              { id: 'Kurtis Weissnat', itemName: 'Kurtis Weissnat' },
              { id: 'Chelsey Dietrich', itemName: 'Chelsey Dietrich' },
            ],
          },
        },
      },
      email: {
        title: 'Email',
        filter: {
          type: 'completer',
          config: {
            completer: {
              data: this.data,
              searchFields: 'email',
              titleField: 'email',
            },
          },
        },
      },
      passed: {
        title: 'Passed',
        filter: {
          type: 'checkbox',
          config: {
            true: 'Yes',
            false: 'No',
            resetText: 'clear',
          },
        },
      },
    },
  };
}
