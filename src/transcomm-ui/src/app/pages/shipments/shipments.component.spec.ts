import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  ColumnApi,
  GridApi,
  RowDoubleClickedEvent,
  RowNode,
} from '@ag-grid-community/core';
import { OrderOverview, Paginated } from 'core/viewModels';
import { Observable, of, Subject } from 'rxjs';
import { Routerlinks } from '../../auth/router-links';
import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { OverviewService } from '../../services/orderEndpoints/overview.service';
import { ShipmentsComponent } from './shipments.component';

jest.mock('../../auth/router-links', () => ({
  Routerlinks: { shipments: 'shipments' },
}));
jest.mock('../../constants/agProps', () => ({
  dateFilterParams: {},
  dateFormatter: {},
  ecomCodeColumn: {},
  invoiceNumberColumn: {},
  lastActionDateColumn: {},
  numberOfItemsColumn: {},
  orderDateColumn: {},
  orderNumberColumn: {},
}));

const mockOverviewData: OrderOverview[] = [
  {
    ecomCode: 'ecom1',
    invoiceNumber: 'invoice1',
    declarationStatus: 'a',
    declarationType: 'b',
    orderStatus: 'Cleared',
    transport: 'FN',
    numberOfItems: 1,
    orderNumber: 'order1',
  },
  {
    ecomCode: 'ecom2',
    invoiceNumber: 'invoice2',
    declarationStatus: 'a',
    declarationType: 'b',
    orderStatus: 'Cleared',
    transport: 'FN',
    numberOfItems: 2,
    orderNumber: 'order2',
  },
  {
    ecomCode: 'ecom3',
    invoiceNumber: 'invoice3',
    declarationStatus: 'a',
    declarationType: 'b',
    orderStatus: 'Cleared',
    transport: 'FN',
    numberOfItems: 3,
    orderNumber: 'order3',
  },
];

const mockPaginatedData$ = of({
  data: mockOverviewData,
  numberOfRecords: mockOverviewData.length,
});

class MockAggridService {
  activePage = 1;
  numberOfPages = 1;
  numberOfRows = 2;
  numberPerPage = 10;

  refreshDataSubject = new Subject<ApiDataParams>();
  refreshData$ = this.refreshDataSubject.asObservable();

  clearFilters = () => {
    // trigger refresh here?
    return null;
  };
}
class MockOverviewService {
  getData = (): Observable<Paginated<OrderOverview>> => {
    // trigger refresh here?
    return mockPaginatedData$;
  };
}

@Component({
  selector: 'app-aggrid',
  template: '<p>Mock aggrid Component</p>',
})
class MockAggridComponent {
  @Input() paginatedData$;
  @Input() columnDefs;
  @Output() onRowDoubleClickedEvent = new EventEmitter<number>();
}

class MockRouter {
  navigateByUrl = (): void => {
    return null;
  };
}

const defaultParams: ApiDataParams = {
  newPage: 1,
  searchParams: {},
  sortParams: [{ lastActionDate: 'desc' }],
};
describe('ShipmentsComponent', () => {
  let component: ShipmentsComponent;
  let fixture: ComponentFixture<ShipmentsComponent>;
  let aggridService: AggridService;
  let overviewService: OverviewService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShipmentsComponent, MockAggridComponent],
      providers: [
        { provide: AggridService, useClass: MockAggridService },
        { provide: OverviewService, useClass: MockOverviewService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();
    aggridService = TestBed.inject(AggridService);
    overviewService = TestBed.inject(OverviewService);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentsComponent);
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

    // test for subscription set successfully?
  });

  describe('setData', () => {
    it('correctly calls the service', () => {
      fixture.detectChanges();
      const serviceSpy = jest.spyOn(overviewService, 'getData');
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
        expect(res.data).toEqual(mockOverviewData);
        expect(res.numberOfRecords).toEqual(mockOverviewData.length);
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
    it('dataChangeFromModalHandler', () => {
      const serviceSpy = jest.spyOn(aggridService, 'clearFilters');
      component.dataChangedFromModalHandler();
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
        `${Routerlinks.shipments}/${event.data.ecomCode}/${event.data.orderNumber}/${event.data.invoiceNumber}`,
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
