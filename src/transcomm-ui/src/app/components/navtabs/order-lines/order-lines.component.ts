import { Component, Input, OnInit } from '@angular/core';
import { OrderLineView } from 'core/viewModels';
import {
  compareAlphaNumericString,
  compareDate,
} from 'src/app/helpers/sortHelpers';

interface OrderLineColumn {
  displayName: string;
  selector: string[];
  type: 'single' | 'double';
}



@Component({
  selector: 'app-order-lines',
  templateUrl: './order-lines.component.html',
  styleUrls: ['./order-lines.component.css'],
  host: { class: 'overflow-x-auto' },
})
export class OrderLinesComponent implements OnInit {
  @Input() orderLines!: OrderLineView[];

  headers: OrderLineColumn[] = [
    { displayName: 'Line No.', selector: ['lineNumber'], type: 'single' },
    { displayName: 'Mode', selector: ['mode'], type: 'single' },
    { displayName: 'Commodity Code', selector: ['hsCode'], type: 'single' },
    { displayName: 'Goods Description', selector: ['description'], type: 'single' },
    { displayName: 'Goods Condition', selector: ['goodsCondition'], type: 'single' },
    { displayName: 'COO', selector: ['countryOfOrigin'], type: 'single' },
    { displayName: 'Quantity', selector: ['quantity'], type: 'single' },
    { displayName: 'Weight + Unit', selector: ['netWeight', 'netWeightUOM'], type: 'double' },
    { displayName: 'Unit Price', selector: ['unitPrice'], type: 'single' },
    { displayName: 'Discount', selector: ['discountValue'], type: 'single' },
    { displayName: 'Total', selector: ['total'], type: 'single' },
    { displayName: 'Return Request No', selector: ['returnRequestNumber'], type: 'single' },
  ];

  ngOnInit(): void {
    this.orderLines.sort((a, b) => {
      return (
        compareAlphaNumericString(a.lineNumber, b.lineNumber) ||
        compareDate(a.actionDate, b.actionDate)
      );
    });
  }
}
