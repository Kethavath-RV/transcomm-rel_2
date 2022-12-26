import { Component, Input, OnInit } from '@angular/core';
import { AddressView, OrderView } from 'core/viewModels';

@Component({
  selector: 'app-address-cards',
  templateUrl: './address-cards.component.html',
  styleUrls: ['./address-cards.component.css'],
})
export class AddressCardsComponent implements OnInit {
  @Input('orderDetails') orderDetails: OrderView;
  ship: AddressView;
  bill: AddressView;
  sold: AddressView;
  ngOnInit(): void {
    this.orderDetails.addresses.map((address) => {
      if (address.type === 'SOLD') {
        this.sold = address;
      } else if (address.type === 'BILL') {
        this.bill = address;
      } else {
        this.ship = address;
      }
    });
    if (this.orderDetails.addresses.length === 1) {
      this.sold = this.orderDetails.addresses[0];
      this.bill = this.orderDetails.addresses[0];
      this.ship = this.orderDetails.addresses[0];
    }
  }
}
