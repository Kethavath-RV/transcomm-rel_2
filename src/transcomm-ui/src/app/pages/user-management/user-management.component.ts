import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColDef, RowDoubleClickedEvent } from '@ag-grid-community/core';
import { Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { Paginated, UserResponse } from 'core/viewModels';
import { usersColumnDefs } from './columns';
import { SessionStorageService } from '../../auth/services/session/session-storage.service';
import { ApiDataParams } from '../../models/prismaModels';
import { AggridService } from '../../services/aggrid.service';
import { ModalService } from '../../services/modal.service';
import { UsersService } from '../../services/users.service';
import { UserModalComponent } from './user-modal/user-modal.component';
import { WarningModalComponent } from './warning-modal/warning-modal.component';
import { InputTypes, OutputTypes } from './user-management.module';

type UserModals = UserModalComponent | WarningModalComponent;

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit, OnDestroy {
  columnDefs: ColDef[] = usersColumnDefs;
  modalType = null;
  editUser!: UserResponse;
  paginatedData$!: Observable<Paginated<UserResponse>>;
  userProfile!: UserResponse;

  private readonly destroy$ = new Subject();

  constructor(
    private usersService: UsersService,
    public aggridService: AggridService,
    private readonly session: SessionStorageService,
    private readonly modalService: ModalService<
      UserModals,
      InputTypes,
      OutputTypes
    >,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.setData({
      newPage: 1,
      searchParams: {},
      sortParams: [],
    });
    this.userProfile = this.session.getUserProfile();
    this.aggridService.refreshData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.setData(res);
      });
  }

  openModal(modalType: string): void {
    if (modalType === 'delete') {
      this.modalService.open(WarningModalComponent, this.editUser.id);

      this.modalService.modalOutputdata
        .pipe(first())
        .subscribe((operation: 'deleted' | 'backToEdit') => {
          if (operation === 'deleted') {
            this.aggridService.triggerDataRefresh();
          } else {
            this.openModal('edit');
          }
        });
    } else {
      this.modalService.open(UserModalComponent, {
        modalType,
        userRole: this.userProfile.role,
        editUser: this.editUser,
      });

      this.modalService.modalOutputdata
        .pipe(first())
        .subscribe((operation: 'delete' | 'refresh' | 'none') => {
          switch (operation) {
            case 'refresh':
              this.aggridService.triggerDataRefresh();
              break;
            case 'delete':
              this.openModal('delete');
              break;
            default:
              break;
          }
        });
    }
  }

  setData(apiDataParams: ApiDataParams): void {
    const { searchParams, sortParams, newPage } = apiDataParams;
    this.paginatedData$ = this.usersService.getData(
      searchParams,
      sortParams,
      newPage ?? 1,
    );
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    if (this.userProfile.role !== 'super_admin') {
      this.editUser = event.data;
      this.openModal('edit');
    }
  }

  clearFilters(): void {
    this.aggridService.clearFilters();
  }

  dataChangedFromModalHandler(): void {
    this.aggridService.clearFilters();
  }
}
