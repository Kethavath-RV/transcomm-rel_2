import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InvoicesView } from 'core/viewModels';

@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
})
export class LockerComponent {
  @Input() invoice: InvoicesView;
  @Input() user: string;
  @Input() row: boolean;
  @Input() disabled: boolean;
  @Output() lockEmitter: EventEmitter<null> = new EventEmitter();

  onLock(): void {
    this.lockEmitter.emit();
  }
}
