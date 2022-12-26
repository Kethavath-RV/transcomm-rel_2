import { Injectable } from '@angular/core';
import { ColumnApi, GridApi, GridReadyEvent } from '@ag-grid-community/core';
import { Subject } from 'rxjs';
import { calculateNumberOfPages } from '../helpers/calculateNumberOfPages';
import {
  prismaFilterBuilder,
  prismaSortBuilder,
} from '../helpers/prismaHelpers';
import {
  ApiDataParams,
  PrismaOrderByInput,
  PrismaWhereInput,
} from '../models/prismaModels';

@Injectable({
  providedIn: 'root',
})
export class AggridService {
  refreshDataSubject = new Subject<ApiDataParams>();
  refreshData$ = this.refreshDataSubject.asObservable(); // subscribe to this to trigger action

  public activePage = 1;
  public numberOfPages: number; //calculated
  public numberOfRows: number;
  public numberPerPage = 10;

  // set by component, interacted with by parent
  gridApi: GridApi;
  columnApi: ColumnApi;

  // idea of a generic filter and sorting
  private filters: PrismaWhereInput = {};
  private sorting: PrismaOrderByInput[] = [];

  clearService(): void {
    this.filters = {};
    this.sorting = [];
    this.numberOfPages = undefined;
    this.numberOfRows = undefined;
  }

  setGridApis(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
  triggerDataRefresh(): void {
    this.refreshDataSubject.next(this.getParams());
  }

  getParams(): ApiDataParams {
    return {
      newPage: this.activePage,
      searchParams: this.filters,
      sortParams: this.sorting,
    };
  }

  setParams(apiDataParams: ApiDataParams): void {
    const { newPage, searchParams, sortParams } = apiDataParams;

    this.activePage = newPage;
    this.filters = searchParams;
    this.sorting = sortParams;

    this.triggerDataRefresh();
  }

  clearFilters(): void {
    // There's a chance this calls twice, maybe only set params needed
    this.gridApi.setFilterModel({});
    this.columnApi.resetColumnState();
    this.setParams({
      sortParams: [],
      searchParams: {},
      newPage: 1,
    } as ApiDataParams);
  }

  newPageHandler(newPage: number): void {
    this.activePage = newPage;
    this.triggerDataRefresh();
  }

  setNumberOfRecords(numberOfRows: number): void {
    this.numberOfRows = numberOfRows;
    this.numberOfPages = calculateNumberOfPages(
      numberOfRows,
      this.numberPerPage,
    );
  }
  getNumberOfRecords(): number {
    return this.numberOfRows; // delete this?
  }

  /*** Sort Section ***/
  onSortChanged(): void {
    const columnModelArray = this.columnApi.getColumnState();

    const prismaSort = prismaSortBuilder(columnModelArray);

    this.setParams({
      newPage: 1,
      sortParams: prismaSort,
      searchParams: this.filters,
    });
  }

  /*** filter section ***/
  onFilterChanged(): void {
    const filterModel = this.gridApi.getFilterModel();
    const prismaFilter = prismaFilterBuilder(filterModel);

    this.setParams({
      newPage: 1,
      searchParams: prismaFilter,
      sortParams: this.sorting,
    });
  }
}
