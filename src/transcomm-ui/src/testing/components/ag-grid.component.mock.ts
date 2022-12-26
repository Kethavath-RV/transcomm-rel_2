import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-aggrid',
  template: '<p>Mock aggrid Component</p>',
})
export class MockAggridComponent {
  @Input() paginatedData$;
  @Input() columnDefs;
  @Output() onRowDoubleClickedEvent = new EventEmitter<number>();
}
