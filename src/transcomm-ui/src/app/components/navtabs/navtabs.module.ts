import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DirectivesModule } from 'src/app/helpers/directives/directives.module';
import { DeclarationsComponent } from './declarations/declarations.component';
import { DeliveredComponent } from './delivered/delivered.component';
import { HouseBillsComponent } from './house-bills/house-bills.component';
import { MovementsComponent } from './movements/movements.component';
import { PackageDetailsComponent } from './movements/package-details/package-details.component';
import { ShippingDetailsComponent } from './movements/shipping-details/shipping-details.component';
import { NavtabsComponent } from './navtabs.component';
import { OrderLinesComponent } from './order-lines/order-lines.component';
import { ReturnReceiptsComponent } from './return-receipts/return-receipts.component';

@NgModule({
  declarations: [
    NavtabsComponent,
    DeclarationsComponent,
    DeliveredComponent,
    HouseBillsComponent,
    MovementsComponent,
    OrderLinesComponent,
    ReturnReceiptsComponent,
    PackageDetailsComponent,
    ShippingDetailsComponent,
  ],
  imports: [CommonModule, DirectivesModule],
  exports: [NavtabsComponent],
})
export class OrderDetailTabsModule {}
