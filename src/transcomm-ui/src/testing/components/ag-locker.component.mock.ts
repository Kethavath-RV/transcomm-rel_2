/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ExceptionOverview, UserResponse } from 'core/viewModels';

@Component({
  selector: 'app-ag-locker',
  template: '<p>lmao</p>',
})
export class MockAgLockerComponent {
  cellValue: string;
  order: ExceptionOverview;
  userProfile: UserResponse;
  lockIsDisabled: boolean;

  agInit(_params: ICellRendererParams): void {
    return;
  }
  refresh(_params: ICellRendererParams): void {
    return;
  }
  getValueToDisplay(params: ICellRendererParams): string {
    return params.valueFormatted ? params.valueFormatted : params.value;
  }
  onLock(): void {
    return;
  }

  setPageToReadOrWrite(): void {
    return;
  }

  editorCanEdit(): boolean {
    return true;
  }

  userIsEditor(): boolean {
    return true;
  }

  unlockedOrLockedByCurrentUser(): boolean {
    return true;
  }

  lockedAndUserIsAdmin(): boolean {
    return true;
  }
}
