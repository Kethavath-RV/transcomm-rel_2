import { Component, Input } from '@angular/core';
import { ShippingDetailsView } from 'core/viewModels';

@Component({
  selector: 'app-shipping-details',
  templateUrl: './shipping-details.component.html',
})
export class ShippingDetailsComponent {
  @Input() shippingDetails!: ShippingDetailsView;
}