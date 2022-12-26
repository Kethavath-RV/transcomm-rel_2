import { Component, Input, OnInit } from '@angular/core';
import { ReturnReceiptView } from 'core/viewModels';
import {
  compareAlphaNumericString,
  compareDate,
} from 'src/app/helpers/sortHelpers';

@Component({
  selector: 'app-return-receipts',
  templateUrl: './return-receipts.component.html',
  styleUrls: ['./return-receipts.component.css'],
})
export class ReturnReceiptsComponent implements OnInit {
  @Input('returnReceipts') returnReceipts: ReturnReceiptView[];

  headers = [
    'Line No.',
    'Commodity Code',
    'SKU',
    'Is Extra',
    'Received Quantity + Unit',
    'Goods Condition',
  ];

  ngOnInit(): void {
    this.returnReceipts.sort((a, b) => {
      return compareDate(
        a.dateOfReceivingBackGoods,
        b.dateOfReceivingBackGoods,
      );
    });

    this.returnReceipts.forEach((receipt) => {
      receipt.lineItems?.sort((a, b) => {
        return compareAlphaNumericString(a.lineNumber, b.lineNumber);
      });
    });
  }
}
