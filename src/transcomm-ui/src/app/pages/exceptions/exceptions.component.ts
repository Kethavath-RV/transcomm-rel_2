import { ColDef, RowDoubleClickedEvent } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExceptionOverview, Paginated } from 'core/viewModels';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Routerlinks } from '../../auth/router-links';
import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { ExceptionsService } from '../../services/orderEndpoints/exceptions.service';
import { exceptionColumnDefs } from './columns';


@Component({
selector: 'app-exceptions',
  templateUrl: './exceptions.component.html',
})
export class ExceptionsComponent implements OnInit, OnDestroy {
  columnDefs: ColDef[] = exceptionColumnDefs;

  paginatedData$: Observable<Paginated<ExceptionOverview>>;
  
  private readonly destroy$ = new Subject();

  constructor(
    private exceptionsService: ExceptionsService,
    private router: Router,
    public aggridService: AggridService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.setData({
      newPage: 1,
      searchParams: {},
      sortParams: [{ lastActionDate: 'desc' }],
    });

    this.aggridService.refreshData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.setData(res);
      });
  }

  setData(apiDataParams: ApiDataParams): void {
    this.paginatedData$ = this.exceptionsService.getData(
      apiDataParams.searchParams,
      apiDataParams.sortParams,
      apiDataParams.newPage ?? 1,
    );
  }
  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.router.navigateByUrl(
      `${Routerlinks.exceptions}/${event.data.ecomCode}/${event.data.orderNumber}/${event.data.invoiceNumber}`,
    );
  }
  clearFilters(): void {
    this.aggridService.clearFilters();
  }
}
