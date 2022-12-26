import { TestBed } from '@angular/core/testing';
import { ColumnApi, ColumnState, GridApi } from '@ag-grid-community/core';
import * as calculateNumberOfPages from '../helpers/calculateNumberOfPages';
import {
  prismaFilterBuilder,
  prismaSortBuilder
} from '../helpers/prismaHelpers';
import { ApiDataParams, FilterModelType } from '../models/prismaModels';
import { AggridService } from './aggrid.service';

const initialParams: ApiDataParams = {
  newPage: 1,
  searchParams: {},
  sortParams: [],
};

const apiDataParams: ApiDataParams = {
  newPage: 1,
  searchParams: { exampleField: { contains: 'a' } },
  sortParams: [{ exampleField: 'asc' }],
};

const defaultFilterModelMock: {
  [field: string]: FilterModelType;
} = {
  field1: { type: 'single', condition1: { contains: 'a' } } as FilterModelType,
  field2: {
    type: 'AND',
    condition1: { contains: 'a' },
    condition2: { contains: 'b' },
  } as FilterModelType,
  field3: {
    type: 'OR',
    condition1: { contains: 'a' },
    condition2: { contains: 'b' },
  } as FilterModelType,
};

const columnStateArray: ColumnState[] = [
  {
    colId: 'field1',
  },
  {
    colId: 'field2',
    sort: 'asc',
    sortIndex: 1,
  },
  {
    colId: 'field3',
    sort: 'desc',
    sortIndex: 0,
  },
];

describe('AggridService', () => {
  let service: AggridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AggridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty variables', () => {
    const params = service.getParams();
    expect(params).toEqual(initialParams);
  });

  describe('methods', () => {
    describe('setParams', () => {
      it('sets filters and sorting', () => {
        const triggerDataRefreshSpy = jest.spyOn(service, 'triggerDataRefresh');

        service.setParams(apiDataParams);
        const params = service.getParams();
        expect(params).toEqual(apiDataParams);
        expect(triggerDataRefreshSpy).toHaveBeenCalled();
      });
    });

    describe('clearService', () => {
      it('should clear the sorting and filtering variables', () => {
        service.setParams(apiDataParams);
        service.clearService();
        const params = service.getParams();
        expect(params.searchParams).toEqual({});
        expect(params.sortParams).toEqual([]);
      });
    });

    describe('clearFilters', () => {
      it('should clear state', () => {
        const grid = new GridApi();
        const column = new ColumnApi();

        const gridSpy = jest
          .spyOn(grid, 'setFilterModel')
          .mockImplementation(() => null);
        const columnSpy = jest
          .spyOn(column, 'resetColumnState')
          .mockImplementation(() => null);
        const setParamsSpy = jest.spyOn(service, 'setParams');

        service.setGridApis({ type: '', api: grid, columnApi: column });

        service.clearFilters();

        expect(gridSpy).toHaveBeenCalledWith({});
        expect(columnSpy).toHaveBeenCalled();
        expect(setParamsSpy).toHaveBeenCalledWith(initialParams);
      });
    });

    describe('newPageHandler', () => {
      it('should set new page', () => {
        const triggerDataRefreshSpy = jest.spyOn(service, 'triggerDataRefresh');
        const newPage = 5;

        service.newPageHandler(newPage);

        expect(service.getParams().newPage).toEqual(newPage);
        expect(triggerDataRefreshSpy).toHaveBeenCalled();
      });
    });

    describe('setNumberOfRecords', () => {
      it('set number of rows correctly', () => {
        const calculateNumberOfPagesSpy = jest.spyOn(
          calculateNumberOfPages,
          'calculateNumberOfPages',
        );
        const numberOfRows = 5;

        service.setNumberOfRecords(numberOfRows);

        expect(service.getNumberOfRecords()).toEqual(numberOfRows);
        expect(calculateNumberOfPagesSpy).toHaveBeenCalledWith(
          numberOfRows,
          service.numberPerPage,
        );
      });
    });
  });

  describe('Sorting - onSortChanged', () => {
    it('should set sort Params', () => {
      const grid = new GridApi();
      const column = new ColumnApi();
      const columnSpy = jest
        .spyOn(column, 'getColumnState')
        .mockImplementation(() => columnStateArray);
      const setParamsSpy = jest.spyOn(service, 'setParams');

      service.setGridApis({ type: '', api: grid, columnApi: column });

      service.onSortChanged();

      expect(columnSpy).toHaveBeenCalled();

      expect(setParamsSpy).toHaveBeenCalledWith({
        newPage: 1,
        sortParams: prismaSortBuilder(columnStateArray),
        searchParams: {},
      });
    });
  });

  describe('Filtering - onFilterChanged', () => {
    it('should set Filter Params', () => {
      const grid = new GridApi();
      const column = new ColumnApi();
      const gridSpy = jest
        .spyOn(grid, 'getFilterModel')
        .mockImplementation(() => defaultFilterModelMock);
      const setParamsSpy = jest.spyOn(service, 'setParams');

      service.setGridApis({ type: '', api: grid, columnApi: column });

      service.onFilterChanged();

      expect(gridSpy).toHaveBeenCalled();
      expect(setParamsSpy).toHaveBeenCalledWith({
        newPage: 1,
        sortParams: [],
        searchParams: prismaFilterBuilder(defaultFilterModelMock),
      });
    });
  });
});
