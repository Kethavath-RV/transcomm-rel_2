import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InvoiceParamGuard } from 'src/app/auth/guards/invoice-param.guard';
import { Routerlinks } from 'src/app/auth/router-links';
import { GlobalAgGridModule } from 'src/app/components/aggrid/ag-grid.module';
import { LoaderModule } from 'src/app/components/loader/loader.module';
import { LockerModule } from 'src/app/components/locker/locker.module';
import { OrderDetailTabsModule } from 'src/app/components/navtabs/navtabs.module';
import { ExceptionsService } from 'src/app/services/orderEndpoints/exceptions.service';
import { DirectivesModule } from '../../helpers/directives/directives.module';
import { AmendableFieldsComponent } from './amendable-fields/amendable-fields.component';
import { DeclarationAmendmentComponent } from './declaration-amendment/declaration-amendment.component';

import { ExceptionsComponent } from './exceptions.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ExceptionsComponent,
      },
      {
        path: Routerlinks.invoiceParam,
        component: DeclarationAmendmentComponent,
        canActivate: [InvoiceParamGuard],
      },
    ]),
    CommonModule,
    ReactiveFormsModule,
    GlobalAgGridModule,
    OrderDetailTabsModule,
    LoaderModule,
    LockerModule,
    DirectivesModule
  ],
  declarations: [
    ExceptionsComponent,
    DeclarationAmendmentComponent,
    AmendableFieldsComponent,
  ],
  providers: [ExceptionsService],
})
export class ExceptionsModule {}
