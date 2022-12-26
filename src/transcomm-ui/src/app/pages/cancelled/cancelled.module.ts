import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routerlinks } from '../../auth/router-links';
import { CancelledService } from '../../services/orderEndpoints/cancelled.service';
import { InvoiceParamGuard } from '../../auth/guards/invoice-param.guard';
import { GlobalAgGridModule } from '../../components/aggrid/ag-grid.module';

import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { CancelledComponent } from './cancelled.component';
import { DirectivesModule } from '../../helpers/directives/directives.module';

@NgModule({
  declarations: [CancelledComponent],
  imports: [
    GlobalAgGridModule,
    DirectivesModule,
    RouterModule.forChild([
      {
        path: '',
        component: CancelledComponent,
      },
      {
        path: Routerlinks.invoiceParam,
        component: OrderDetailComponent,
        canActivate: [InvoiceParamGuard],
      },
    ]),
  ],
  providers: [CancelledService],
})
export class CancelledModule {}
