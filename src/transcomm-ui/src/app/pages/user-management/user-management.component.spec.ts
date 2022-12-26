import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ColumnApi,
  GridApi,
  RowDoubleClickedEvent,
  RowNode,
} from '@ag-grid-community/core';
import {
  MockAggridComponent,
  MockAggridService,
  MockModalService,
  MockSessionStorageService,
  MockUserModalComponent,
  mockUserResponseData,
  MockUsersService,
  MockWarningModalComponent,
} from '../../../testing';
import { SessionStorageService } from '../../auth/services/session/session-storage.service';
import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { ModalService } from '../../services/modal.service';
import { UsersService } from '../../services/users.service';
import { UserManagementComponent } from './user-management.component';

jest.mock('./user-modal/user-modal.component', () => MockUserModalComponent);
jest.mock(
  './warning-modal/warning-modal.component',
  () => MockWarningModalComponent,
);

const defaultParams: ApiDataParams = {
  newPage: 1,
  searchParams: {},
  sortParams: [],
};
describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let aggridService: AggridService;
  let usersService: UsersService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserManagementComponent, MockAggridComponent],
      providers: [
        { provide: AggridService, useClass: MockAggridService },
        { provide: UsersService, useClass: MockUsersService },
        { provide: SessionStorageService, useClass: MockSessionStorageService },
        { provide: ModalService, useClass: MockModalService },
      ],
    }).compileComponents();
    aggridService = TestBed.inject(AggridService);
    usersService = TestBed.inject(UsersService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementComponent);
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
      const serviceSpy = jest.spyOn(usersService, 'getData');
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
        expect(res.data).toEqual(mockUserResponseData);
        expect(res.numberOfRecords).toEqual(mockUserResponseData.length);
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
      data: mockUserResponseData[0],
      node: new RowNode(null),
      api: new GridApi(),
      columnApi: new ColumnApi(),
      rowIndex: 0,
      type: 'rowDoubleClicked',
      rowPinned: null,
    };

    it('calls modal when user is not super admin', () => {
      fixture.detectChanges();
      const modalSpy = jest.spyOn(component, 'openModal');
      component.onRowDoubleClicked(event);
      expect(modalSpy).toHaveBeenCalledWith('edit');
    });
    it('does nothing when user is superadmin', () => {
      fixture.detectChanges();
      component.userProfile.role = 'super_admin';
      const modalSpy = jest.spyOn(component, 'openModal');
      component.onRowDoubleClicked(event);
      expect(modalSpy).not.toBeCalled();
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

  describe('Modal methods', () => {
    // it('is set to true when opened', () => {
    //   const type = 'edit';
    //   component.openModal(type);
    //   expect(component.modal).toEqual(true);
    //   expect(component.modalType).toEqual(type);
    // });
    // it('is set to false when closed', () => {
    //   component.closeModal();
    //   expect(component.modal).toEqual(false);
    // });
  });
});
