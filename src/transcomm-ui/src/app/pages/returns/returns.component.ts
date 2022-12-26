import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RowDoubleClickedEvent } from '@ag-grid-community/core';
import { Paginated, ReturnedOrderOverview } from 'core/viewModels';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Routerlinks } from '../../auth/router-links';

import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { ReturnedService } from '../../services/orderEndpoints/returned.service';
import { returnedColumnDefs } from './columns';

@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
})
export class ReturnsComponent implements OnInit {
  columnDefs = returnedColumnDefs;
  paginatedData$: Observable<Paginated<ReturnedOrderOverview>>; // maybe unneccessary

  constructor(
    private returnedService: ReturnedService,
    private router: Router,
    public aggridService: AggridService,
  ) {}

  private readonly destroy$ = new Subject();
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.setData({
      newPage: 1,
      searchParams: {},
      sortParams: [{ lastActionDate: 'desc' }], // why is this not default BE already?
    });

    this.aggridService.refreshData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.setData(res);
      });
  }

  setData(apiDataParams: ApiDataParams): void {
    this.paginatedData$ = this.returnedService.getData(
      apiDataParams.searchParams,
      apiDataParams.sortParams,
      apiDataParams.newPage ?? 1,
    );
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.router.navigateByUrl(
      `${Routerlinks.returns}/${event.data.ecomCode}/${event.data.orderNumber}/${event.data.invoiceNumber}`,
    );
  }
  clearFilters(): void {
    this.aggridService.clearFilters();
  }

  dataChangedFromModalHandler(): void {
    this.aggridService.clearFilters();
  }
}
