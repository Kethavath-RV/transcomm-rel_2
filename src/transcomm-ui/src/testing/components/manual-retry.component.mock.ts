import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-manual-retry-modal',
  template: '<p>Mock Manual Retry Modal Component</p>',
})
export class MockBadManualRetryModalComponent {
  @Input() modal;
  @Input() modalType;
  @Output() closeModalEvent = new EventEmitter();
  @Output() submitEvent = new EventEmitter();
}
