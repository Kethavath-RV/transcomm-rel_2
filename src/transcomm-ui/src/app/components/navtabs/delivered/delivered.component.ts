import { Component, Input, OnInit } from '@angular/core';
import { DeliveredView } from 'core/viewModels';
import { compareDate } from 'src/app/helpers/sortHelpers';

@Component({
  selector: 'app-delivered',
  templateUrl: './delivered.component.html',
  styleUrls: ['./delivered.component.css']
})
export class DeliveredComponent implements OnInit {
  @Input() delivered!: DeliveredView[];

  columns = [
    { displayName: 'Airway Bill No.', selector: 'airwayBillNumber' },
    { displayName: 'Delivery Date', selector: 'deliveryDate' },
    { displayName: 'Delivery Status', selector: 'deliveryStatus' },
    { displayName: 'Origin', selector: 'origin' },
    { displayName: 'Destination', selector: 'destination' },
  ];

  ngOnInit(): void {
    this.delivered.sort((a, b) => {
      return compareDate(a.deliveryDate, b.deliveryDate);
    });
  }
}
