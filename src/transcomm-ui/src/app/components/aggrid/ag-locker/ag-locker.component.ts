import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ExceptionOverview, UserResponse } from 'core/viewModels';
import { first } from 'rxjs/operators';
import { SessionStorageService } from 'src/app/auth/services/session/session-storage.service';
import { ExceptionsService } from '../../../services/orderEndpoints/exceptions.service';

@Component({
  selector: 'app-ag-locker',
  templateUrl: './ag-locker.component.html',
  styleUrls: ['./ag-locker.component.css'],
})
export class AgLockerComponent {
  cellValue: string;
  order: ExceptionOverview;
  userProfile: UserResponse;
  lockIsDisabled: boolean;

  constructor(
    private exceptionsService: ExceptionsService,
    private readonly session: SessionStorageService,
  ) {}

  agInit(params: ICellRendererParams): void {
    this.order = params.data;
    this.userProfile = this.session.getUserProfile();
    this.cellValue = this.getValueToDisplay(params);
    this.setPageToReadOrWrite();
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): void {
    // set value into cell again
    this.order = params.data;
    this.cellValue = this.getValueToDisplay(params);
    this.setPageToReadOrWrite();
  }

  getValueToDisplay(params: ICellRendererParams): string {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }

  onLock(): void {
    this.exceptionsService
      .changeOrderLock(!this.order.locked, {
        ecomBusinessCode: this.order.ecomCode,
        orderNumber: this.order.orderNumber,
        invoiceNumber: this.order.invoiceNumber,
      })
      .pipe(first())
      .subscribe((dto: any) => {
        this.order.locked = !this.order.locked;
        this.order.lockedBy = this.order.locked ? dto.email : '';
        this.cellValue = this.order.lockedBy;

        this.setPageToReadOrWrite();
      });
  }

  setPageToReadOrWrite(): void {
    if (this.editorCanEdit() || this.lockedAndUserIsAdmin()) {
      this.lockIsDisabled = false;
    } else {
      this.lockIsDisabled = true;
    }
  }

  editorCanEdit(): boolean {
    return this.userIsEditor() && this.unlockedOrLockedByCurrentUser();
  }

  userIsEditor(): boolean {
    return this.userProfile.role === 'editor';
  }

  unlockedOrLockedByCurrentUser(): boolean {
    return !this.order.locked || this.order.lockedBy === this.userProfile.email;
  }

  lockedAndUserIsAdmin(): boolean {
    return this.userProfile.role === 'admin' && this.order.locked;
  }
}
