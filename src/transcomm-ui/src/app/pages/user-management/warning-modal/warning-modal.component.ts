import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, NgModule } from '@angular/core';
import { ModalModule } from 'src/app/components/modal-template/modal.module';
import { ModalService } from 'src/app/services/modal.service';
import { UsersService } from 'src/app/services/users.service';
import { InputTypes, OutputTypes } from '../user-management.module';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
})
export class WarningModalComponent implements AfterContentInit {
  userId;
  isLoading = true;
  constructor(
    private readonly modalService: ModalService<
      WarningModalComponent,
      InputTypes,
      OutputTypes
    >,
    private usersService: UsersService,
  ) {}

  ngAfterContentInit(): void {
    const data = this.modalService.getInputData();
    this.userId = Object.values(data).join('');
    this.isLoading = false;
  }
  closeModal(operation: 'backToEdit' | 'deleted'): void {
    this.modalService.close(operation);
  }
  deleteUser(): void {
    this.usersService.delete(this.userId).subscribe((user) => {
      if (user) {
        this.closeModal('deleted');
      }
    });
  }
}

@NgModule({
  imports: [CommonModule, ModalModule],
  declarations: [WarningModalComponent],
})
export class WarningModalModule {}
