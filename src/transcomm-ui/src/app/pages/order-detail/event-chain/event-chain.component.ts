import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChainEventView } from 'core/viewModels';

@Component({
  selector: 'app-event-chain',
  templateUrl: './event-chain.component.html',
  styleUrls: ['./event-chain.component.css'],
})
export class EventChainComponent implements OnInit {
  @Input() eventChain: ChainEventView[];
  @Output() showErrorBundleEvent = new EventEmitter<ChainEventView[]>();

  ngOnInit(): void {
    this.eventChain.sort(
      (a, b) =>
        new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime(),
    );
  }

  openSidebar(chainIndex: number): void {
    const errorBundle: ChainEventView[] = [];
    while (chainIndex < this.eventChain.length) {
      const event = this.eventChain[chainIndex];
      if (this.isError(event)) {
        errorBundle.push(event);
      } else {
        break;
      }
      chainIndex++;
    }
    this.showErrorBundleEvent.emit(errorBundle);
  }

  isError(event: ChainEventView): boolean {
    return (
      event.eventType.includes('Exception') || event.eventType.includes('Error')
    );
  }
}
