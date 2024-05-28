// ...

@Component({ 
  template: `
    <input #search class="search" type="text" placeholder="Search..." (keydown.enter)="onSearch(search.value)">
    <angular2-smart-table [settings]="settings" [source]="source"></angular2-smart-table>
  `
})
// ...