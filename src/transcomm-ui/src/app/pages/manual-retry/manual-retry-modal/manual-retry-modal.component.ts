import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from '../../../components/modal-template/modal.module';
import { ModalService } from '../../../services/modal.service';

type RetryModalType = 'retryOne' | 'purge';

@Component({
  selector: 'app-manual-retry-modal',
  templateUrl: './manual-retry-modal.component.html',
  styleUrls: ['./manual-retry-modal.component.css'],
})
export class ManualRetryModalComponent implements OnInit, AfterContentInit {
  modalType: RetryModalType;
  retryForm!: FormGroup;

  constructor(
    private readonly modalService: ModalService<
      ManualRetryModalComponent,
      string,
      string
    >,
    private readonly fb: FormBuilder,
  ) {}
  ngOnInit(): void {
    this.retryForm = this.fb.group({
      remark: [''],
    });
  }
  ngAfterContentInit(): void {
    this.modalType = this.modalService.getInputData() as RetryModalType;
  }
  onSubmit(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.modalService.close(this.retryForm.controls['remark'].value);
  }
}

@NgModule({
  imports: [CommonModule, ModalModule, ReactiveFormsModule],
  declarations: [ManualRetryModalComponent],
})
export class ManualRetryModalModule {}
