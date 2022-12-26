import { Component, OnInit, OnDestroy } from '@angular/core';
import { ManualRetryRequest, ManualRetryView, Paginated } from 'core/viewModels';
import { Observable, Subject } from 'rxjs';
import { catchError, first, map, takeUntil } from 'rxjs/operators';
import { ModalService } from '../../services/modal.service';
import { AgRetryButtonComponent } from '../../components/aggrid/ag-retry-button/ag-retry-button.component';
import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { ManualRetryService } from '../../services/orderEndpoints/manual-retry.service';
import { retryColumnDefs } from './columns';
import { ManualRetryModalComponent } from './manual-retry-modal/manual-retry-modal.component';

@Component({
  selector: 'app-manual-retry',
  templateUrl: './manual-retry.component.html',
})
export class ManualRetryComponent implements OnInit, OnDestroy {
  paginatedData$: Observable<Paginated<ManualRetryView>>; // maybe unneccessary
  modal = false;
  modalType: 'retryOne' | 'retryAll' | 'purge' = null;
  rowClicked: number | null;
  remark: string;

  columnDefs = retryColumnDefs.concat([
    {
      headerName: 'Retry',
      field: 'retryButton',
      cellRendererFramework: AgRetryButtonComponent,
      cellRendererParams: {
        clicked: (val: number) => {
          this.rowClicked = val;
          this.showModal('retryOne');
        },
      },
      filter: false,
      sortable: false,
    },
  ]);

  constructor(
    private manualRetryService: ManualRetryService,
    public aggridService: AggridService,
    private readonly modalService: ModalService<
      ManualRetryModalComponent,
      string,
      string
    >,
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
      sortParams: [],
    });

    this.aggridService.refreshData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.setData(res);
      });
  }

  setData(apiDataParams: ApiDataParams): void {
    this.paginatedData$ = this.manualRetryService.getData(
      apiDataParams.searchParams,
      apiDataParams.sortParams,
      apiDataParams.newPage ?? 1,
    );
  }

  showModal(modalType: string): void {
    this.modalService.open(ManualRetryModalComponent, modalType);

    this.modalService.modalOutputdata.pipe(first()).subscribe((val) => {
      this.remark = val;
      if (modalType === 'purge') {
        this.purgeData();
      } else if (modalType === 'retryAll') {
        this.retryAll();
      } else {
        this.retryOne();
      }
    });
  }

  dataForService(index?: number): Observable<ManualRetryRequest> {
    return this.paginatedData$.pipe(
      first(),
      map((res) => {
        const gridData = res.data;
        if (index != null) {
          const data = gridData[index];
          return { data: [this.mapDataForService(data)] };
        }

        const dataForService: ManualRetryView[] = [];
        gridData.forEach((row) => {
          dataForService.push(this.mapDataForService(row));
        });

        return { data: dataForService };
      }),
    );
  }

  mapDataForService(data: ManualRetryView): ManualRetryView {
    return {
      orderNumber: data.orderNumber,
      invoiceNumber: data.invoiceNumber,
      ecomCode: data.ecomCode,
      contractMethod: data.contractMethod,
      remark: this.remark,
    };
  }

  purgeData(): void {
    this.dataForService().subscribe((res) => {
      this.manualRetryService
        .purgeOrders(res)
        .pipe(
          first(),
          catchError(async () => console.warn('Order purge failed')),
        )
        .subscribe(() => {
          this.clearFilters();
        });
    });
  }
  retryAll(): void {
    this.dataForService().subscribe((res) => {
      this.retryOrder(res);
    });
  }
  retryOne(): void {
    this.dataForService(this.rowClicked).subscribe((res) => {
      this.retryOrder(res);
    });
  }

  clearFilters(): void {
    this.aggridService.clearFilters();
  }

  private retryOrder(res: ManualRetryRequest): void {
    this.manualRetryService
      .retryOrders(res)
      .pipe(
        first(),
        catchError(async () => console.warn('Order retry failed')),
      )
      .subscribe(() => {
        this.clearFilters();
      });
  }
}
