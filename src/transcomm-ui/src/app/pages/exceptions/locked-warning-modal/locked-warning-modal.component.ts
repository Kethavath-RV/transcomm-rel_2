import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ModalModule } from 'src/app/components/modal-template/modal.module';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-locked-warning-modal',
  templateUrl: './locked-warning-modal.component.html',
  styleUrls: ['./locked-warning-modal.component.css'],
})
export class LockedWarningModalComponent {
  constructor(
    private readonly modalService: ModalService<
      LockedWarningModalComponent,
      void,
      boolean
    >,
  ) {}
  closeModal(isLocking: boolean): void {
    this.modalService.close(isLocking);
  }
}

@NgModule({
  imports: [CommonModule, ModalModule],
  declarations: [LockedWarningModalComponent],
})
export class LockedWarningModalModule {}
