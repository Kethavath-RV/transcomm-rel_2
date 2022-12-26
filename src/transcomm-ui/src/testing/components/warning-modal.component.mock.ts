/* eslint-disable @typescript-eslint/no-empty-function */
import { Component } from '@angular/core';

@Component({
  selector: 'app-warning-modal',
  template: '<p>Mock warning modal Component</p>',
})
export class MockWarningModalComponent {
  closeModal(): void {
    return;
  }
  deleteUser(): void {
    return;
  }
}
