import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  ColDef,
  GridOptions,
  GridReadyEvent,
  RowDoubleClickedEvent,
} from '@ag-grid-community/core';
import { Paginated } from 'core/viewModels';
import { Observable } from 'rxjs';
import {
  PrismaOrderByInput,
  PrismaWhereInput,
} from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { BooleanFilterComponent } from './ag-filters/boolean-filter/boolean-filter.component';
import { DateFilterComponent } from './ag-filters/date-filter/date-filter.component';
import { EnumFilterComponent } from './ag-filters/enum-filter/enum-filter.component';
import { NumberFilterComponent } from './ag-filters/number-filter/number-filter.component';
import { TextFilterComponent } from './ag-filters/text-filter/text-filter.component';

@Component({
  selector: 'app-aggrid',
  templateUrl: './aggrid.component.html',
})
export class AggridComponent<T> implements OnDestroy {
  isLoading = true;
  private _paginatedData$: Observable<Paginated<T>>;
  @Input() set paginatedData$(value: Observable<Paginated<T>>) {
    this._paginatedData$ = value;
    this.setData(this._paginatedData$);
  }

  @Input() columnDefs: ColDef[];
  @Input() gridOptions: GridOptions = {
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
  };

  @Output() onRowDoubleClickedEvent = new EventEmitter<RowDoubleClickedEvent>(); //needed!
  frameworkComponents = {
    textFilter: TextFilterComponent,
    numberFilter: NumberFilterComponent,
    dateFilter: DateFilterComponent,
    enumFilter: EnumFilterComponent,
    booleanFilter: BooleanFilterComponent,
  };

  rowData: T[]; // Will be shown by aggrid
  constructor(public aggridService: AggridService) {}

  searchParams: PrismaWhereInput = {};
  preventingRenderLoop = false;
  sortParams: PrismaOrderByInput[] = [];

  setData(data$: Observable<Paginated<T>>): void {
    data$.subscribe((res) => {
      this.rowData = res.data; // display in grid
      this.aggridService.setNumberOfRecords(res.numberOfRecords);
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.aggridService.clearService();
  }

  onGridReady(params: GridReadyEvent): void {
    this.aggridService.setGridApis(params);
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.onRowDoubleClickedEvent.emit(event); // handled by service?
  }

  onRowDataChanged(): void {
    // invoked by aggrid
  }

  newPageHandler(newPage: number): void {
    this.aggridService.newPageHandler(newPage);
  }

  onSortChanged(): void {
    this.aggridService.onSortChanged();
  }

  onFilterChanged(): void {
    this.aggridService.onFilterChanged();
  }
}
