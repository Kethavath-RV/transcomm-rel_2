import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InvoiceParamGuard } from '../../auth/guards/invoice-param.guard';
import { Routerlinks } from '../../auth/router-links';
import { GlobalAgGridModule } from '../../components/aggrid/ag-grid.module';
import { DirectivesModule } from '../../helpers/directives/directives.module';
import { ReturnedService } from '../../services/orderEndpoints/returned.service';

import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { ReturnsComponent } from './returns.component';

@NgModule({
  declarations: [ReturnsComponent],
  imports: [
    GlobalAgGridModule,
    DirectivesModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReturnsComponent,
      },
      {
        path: Routerlinks.invoiceParam,
        component: OrderDetailComponent,
        canActivate: [InvoiceParamGuard],
      },
    ]),
  ],
  providers: [ReturnedService],
})
export class ReturnsModule {}
