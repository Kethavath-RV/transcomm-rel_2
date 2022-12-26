import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  ColumnApi,
  GridApi,
  RowDoubleClickedEvent,
  RowNode,
} from '@ag-grid-community/core';
import {
  MockAggridComponent,
  MockAggridService,
  mockExceptionColumnDefs,
  MockRouter,
  mockExceptionOverviewData,
  MockExceptionsService,
} from '../../../testing';
import { Routerlinks } from '../../auth/router-links';
import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { ExceptionsService } from '../../services/orderEndpoints/exceptions.service';
import { ExceptionsComponent } from './exceptions.component';

jest.mock('../../app-routing.module', () => ({
  Routerlinks: { exceptions: 'exceptions' },
}));
jest.mock('../../constants/agProps', () => ({
  batchIdColumn: {},
  dateFilterParams: {},
  dateFormatter: {},
  declarationNumberColumn: {},
  declarationStatusColumn: {},
  declarationTypeColumn: {},
  ecomCodeColumn: {},
  invoiceNumberColumn: {},
  lastActionDateColumn: {},
  numberOfItemsColumn: {},
  orderDateColumn: {},
  orderNumberColumn: {},
}));

jest.mock('./columns', () => mockExceptionColumnDefs);

const defaultParams: ApiDataParams = {
  newPage: 1,
  searchParams: {},
  sortParams: [{ lastActionDate: 'desc' }],
};
describe('ExceptionsComponent', () => {
  let component: ExceptionsComponent;
  let fixture: ComponentFixture<ExceptionsComponent>;
  let aggridService: AggridService;
  let exceptionsService: ExceptionsService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExceptionsComponent, MockAggridComponent],
      providers: [
        { provide: AggridService, useClass: MockAggridService },
        { provide: ExceptionsService, useClass: MockExceptionsService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();
    aggridService = TestBed.inject(AggridService);
    exceptionsService = TestBed.inject(ExceptionsService);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialisation', () => {
    it('should set data', () => {
      const setDataSpy = jest.spyOn(component, 'setData');
      fixture.detectChanges();
      expect(setDataSpy).toHaveBeenCalledWith(defaultParams);
    });
  });

  describe('setData', () => {
    it('correctly calls the service', () => {
      fixture.detectChanges();
      const serviceSpy = jest.spyOn(exceptionsService, 'getData');
      const apiDataParams: ApiDataParams = {
        searchParams: { ecomCode: { contains: 'eco' } },
        sortParams: [{ invoiceNumber: 'asc' }],
        newPage: 1,
      };
      component.setData(apiDataParams);
      expect(serviceSpy).toBeCalledWith(
        apiDataParams.searchParams,
        apiDataParams.sortParams,
        apiDataParams.newPage,
      );
    });
    it('correctly sets the data', (done) => {
      fixture.detectChanges();

      const apiDataParams: ApiDataParams = {
        searchParams: { ecomCode: { contains: 'eco' } },
        sortParams: [{ invoiceNumber: 'asc' }],
        newPage: 1,
      };

      component.paginatedData$.subscribe((res) => {
        expect(res.data).toEqual(mockExceptionOverviewData);
        expect(res.numberOfRecords).toEqual(mockExceptionOverviewData.length);
        done();
      });
      component.setData(apiDataParams);
    });
  });

  describe('Service Calls', () => {
    it('clearFilters', () => {
      const serviceSpy = jest.spyOn(aggridService, 'clearFilters');
      component.clearFilters();
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  describe('rowDoubleClicked', () => {
    const event: RowDoubleClickedEvent = {
      context: 'a',
      data: {
        ecomCode: 'ecom1',
        orderNumber: 'order1',
        invoiceNumber: 'invoice1',
      },
      node: new RowNode(null),
      api: new GridApi(),
      columnApi: new ColumnApi(),
      rowIndex: 0,
      type: 'rowDoubleClicked',
      rowPinned: null,
    };
    it('should try to navigate to details page', () => {
      const routerSpy = jest.spyOn(router, 'navigateByUrl');
      component.onRowDoubleClicked(event);
      expect(routerSpy).toBeCalledWith(
        `${Routerlinks.exceptions}/${event.data.ecomCode}/${event.data.orderNumber}/${event.data.invoiceNumber}`,
      );
    });
  });

  describe('Data through behaviour subject', () => {
    it('should set data on refresh', (done) => {
      fixture.detectChanges();
      const componentSpy = jest.spyOn(component, 'setData');
      const changeApiParams: ApiDataParams = {
        newPage: 2,
        searchParams: { ecomCode: { contains: 'newCode' } },
        sortParams: [],
      };
      aggridService.refreshDataSubject.next(changeApiParams);
      expect(componentSpy).toBeCalledWith(changeApiParams);
      done();
    });
  });
});
