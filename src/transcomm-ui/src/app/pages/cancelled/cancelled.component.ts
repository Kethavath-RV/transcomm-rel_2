import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RowDoubleClickedEvent } from '@ag-grid-community/core';
import { CancelledOrderOverview, Paginated } from 'core/viewModels';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Routerlinks } from '../../auth/router-links';
import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { CancelledService } from '../../services/orderEndpoints/cancelled.service';
import { cancelledColumnDefs } from './columns';


@Component({
  selector: 'app-cancelled',
  templateUrl: './cancelled.component.html',
})
export class CancelledComponent implements OnInit, OnDestroy {
  columnDefs = cancelledColumnDefs; //probably necessary but maybe we can initalise with service? i.e.
  paginatedData$: Observable<Paginated<CancelledOrderOverview>>; // maybe unneccessary

  constructor(
    private cancelledService: CancelledService,
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
    this.paginatedData$ = this.cancelledService.getData(
      apiDataParams.searchParams,
      apiDataParams.sortParams,
      apiDataParams.newPage ?? 1,
    );
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    // ** needed
    this.router.navigateByUrl(
      `${Routerlinks.cancelled}/${event.data.ecomCode}/${event.data.orderNumber}/${event.data.invoiceNumber}`,
    );
  }

  clearFilters(): void {
    this.aggridService.clearFilters();
  }

  dataChangedFromModalHandler(): void {
    this.aggridService.clearFilters();
  }
}
