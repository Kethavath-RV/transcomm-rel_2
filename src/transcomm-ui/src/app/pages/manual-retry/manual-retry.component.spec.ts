import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockManualRetryService,
  mockManualRetryViewData,
  MockSessionStorageService,
  MockAggridComponent,
  MockAggridService,
  MockManualRetryModalComponent,
  MockModalService,
} from '../../../testing';

import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { ManualRetryService } from '../../services/orderEndpoints/manual-retry.service';
import { ManualRetryComponent } from './manual-retry.component';
import { SessionStorageService } from '../../auth/services/session/session-storage.service';
import { ModalService } from '../../services/modal.service';

jest.mock('../../auth/router-links', () => ({
  Routerlinks: { returns: 'returns' },
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
jest.mock(
  './manual-retry-modal/manual-retry-modal.component',
  () => MockManualRetryModalComponent,
);
const defaultParams: ApiDataParams = {
  newPage: 1,
  searchParams: {},
  sortParams: [],
};
describe('ManualRetryComponent', () => {
  let component: ManualRetryComponent;
  let fixture: ComponentFixture<ManualRetryComponent>;
  let aggridService: AggridService;
  let manualRetryService: ManualRetryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ManualRetryComponent,
        MockAggridComponent,
        // MockManualRetryModalComponent,
      ],
      providers: [
        { provide: AggridService, useClass: MockAggridService },
        { provide: ManualRetryService, useClass: MockManualRetryService },
        { provide: SessionStorageService, useClass: MockSessionStorageService },
        { provide: ModalService, useClass: MockModalService },
      ],
    }).compileComponents();
    aggridService = TestBed.inject(AggridService);
    manualRetryService = TestBed.inject(ManualRetryService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualRetryComponent);
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
      const serviceSpy = jest.spyOn(manualRetryService, 'getData');
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
        expect(res.data).toEqual(mockManualRetryViewData);
        expect(res.numberOfRecords).toEqual(mockManualRetryViewData.length);
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
