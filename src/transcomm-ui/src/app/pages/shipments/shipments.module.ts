import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OverviewService } from '../../services/orderEndpoints/overview.service';
import { Routerlinks } from '../../auth/router-links';
import { GlobalAgGridModule } from '../../components/aggrid/ag-grid.module';

import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { ShipmentsComponent } from './shipments.component';
import { InvoiceParamGuard } from '../../auth/guards/invoice-param.guard';
import { DirectivesModule } from '../../helpers/directives/directives.module';

@NgModule({
  declarations: [ShipmentsComponent],
  imports: [
    GlobalAgGridModule,
    DirectivesModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShipmentsComponent,
      },
      {
        path: Routerlinks.invoiceParam,
        component: OrderDetailComponent,
        canActivate: [InvoiceParamGuard],
      },
    ]),
  ],
  providers: [OverviewService],
})
export class ShipmentsModule {}
