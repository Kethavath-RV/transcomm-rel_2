import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from '@ag-grid-community/angular';

import { BooleanFilterComponent } from './ag-filters/boolean-filter/boolean-filter.component';
import { DateFilterComponent } from './ag-filters/date-filter/date-filter.component';
import { EnumFilterComponent } from './ag-filters/enum-filter/enum-filter.component';
import { NumberFilterComponent } from './ag-filters/number-filter/number-filter.component';
import { TextFilterComponent } from './ag-filters/text-filter/text-filter.component';
import { AgLinkComponent } from './ag-link/ag-link.component';
import { AgLockerComponent } from './ag-locker/ag-locker.component';
import { AgRetryButtonComponent } from './ag-retry-button/ag-retry-button.component';
import { AggridComponent } from './aggrid.component';
import { PaginationComponent } from './pagination/pagination.component';
import { RowCounterComponent } from './row-counter/row-counter.component';

@NgModule({
  declarations: [
    AggridComponent,
    AgLinkComponent,
    AgLockerComponent,
    AgRetryButtonComponent,
    RowCounterComponent,
    BooleanFilterComponent,
    TextFilterComponent,
    NumberFilterComponent,
    DateFilterComponent,
    EnumFilterComponent,
    PaginationComponent,
  ],
  imports: [
    AgGridModule.withComponents([
      AgLockerComponent,
      TextFilterComponent,
      DateFilterComponent,
      NumberFilterComponent,
    ]),
    RouterModule,
    FormsModule,
    CommonModule,
  ],
  exports: [
    AggridComponent,
    AgLinkComponent,
    AgLockerComponent,
    AgRetryButtonComponent,
    RowCounterComponent,
  ],
})
export class GlobalAgGridModule {}
