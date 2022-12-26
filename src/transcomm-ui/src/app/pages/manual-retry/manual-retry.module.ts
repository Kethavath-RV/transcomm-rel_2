import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GlobalAgGridModule } from '../../components/aggrid/ag-grid.module';
import { ManualRetryService } from '../../services/orderEndpoints/manual-retry.service';
import { InvoiceParamGuard } from '../../auth/guards/invoice-param.guard';
import { Routerlinks } from '../../auth/router-links';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { ManualRetryComponent } from './manual-retry.component';
import { DirectivesModule } from '../../helpers/directives/directives.module';

@NgModule({
  declarations: [ManualRetryComponent],
  imports: [
    GlobalAgGridModule,
    FormsModule,
    DirectivesModule,
    RouterModule.forChild([
      {
        path: '',
        component: ManualRetryComponent,
      },
      {
        path: Routerlinks.invoiceParam,
        component: OrderDetailComponent,
        canActivate: [InvoiceParamGuard],
      }
    ]),
  ],
  providers: [ManualRetryService],
})
export class ManualRetryModule {}
