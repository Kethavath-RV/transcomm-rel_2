import { Component, Input } from '@angular/core';
import {
  DeclarationView,
  DeliveredView,
  HouseBillView,
  MovementView,
  OrderLineView,
  OrderView,
  ReturnReceiptView,
} from 'core/viewModels';

@Component({
  selector: 'app-navtabs',
  templateUrl: './navtabs.component.html',
  styleUrls: ['./navtabs.component.css'],
})
export class NavtabsComponent {
  @Input() set orderDetails(details: OrderView) {
    this.houseBills = details.houseBills;
    this.orderLines = details.invoices[0].orderLine;
    this.movements = details.movements;
    this.declarations = details.declarations;
    this.delivered = details.delivered;
    this.returnReceipts = details.invoices[0].returnReceipts;
  }

  houseBills!: HouseBillView[];
  orderLines!: OrderLineView[];
  movements!: MovementView[];
  declarations!: DeclarationView[];
  delivered!: DeliveredView[];
  returnReceipts!: ReturnReceiptView[];

  tabs = [
    'Order Line',
    'House Bills',
    'Movements',
    'Declarations',
    'Delivered',
    'Receipt of Returns',
  ];

  activeTab = 0;

  setActive(tab: number): void {
    this.activeTab = tab;
  }
}
