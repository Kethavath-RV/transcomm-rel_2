import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ChainEventView } from 'core/viewModels';

@Component({
  selector: 'app-exception-sidebar',
  templateUrl: './exception-sidebar.component.html',
  styleUrls: ['./exception-sidebar.component.css'],
})
export class ExceptionSidebarComponent implements AfterContentInit {
  @Input() errorsInSidebar: ChainEventView[] = [];
  @Output() closeExceptionSidebar: EventEmitter<boolean> = new EventEmitter();

  isLoading = true;

  ngAfterContentInit(): void {
    this.isLoading = false;
  }
  onClose(): void {
    this.closeExceptionSidebar.emit();
  }
}
