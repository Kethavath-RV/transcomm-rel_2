import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, NgModule } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, take } from 'rxjs/operators';

import { UserResponse } from 'core/viewModels';
import { UserRole } from 'core/viewEnums';
import { ErrorFeedbackModule } from '../../../components/error-feedback/error-feedback.module';
import { ModalModule } from '../../../components/modal-template/modal.module';
import { isEqual } from '../../../helpers/isEqual';
import { NewUserRequest } from '../../../models/helper-models';
import { ModalService } from '../../../services/modal.service';
import { UsersService } from '../../../services/users.service';
import { validateEmail, validatePassword } from '../../../validators';
import { InputTypes, OutputTypes } from '../user-management.module';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageService } from '../../../auth/services/session/session-storage.service';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
})
export class UserModalComponent implements AfterContentInit {
  modalType!: string;
  userRole!: UserRole;
  editUser!: UserResponse;

  userForm!: FormGroup;
  showPasswordReset = false;
  disableDelete = false;
  serverFeedback = '';

  isLoading = true;
  constructor(
    private readonly modalService: ModalService<
      UserModalComponent,
      InputTypes,
      OutputTypes
    >,
    private usersService: UsersService,
    private fb: FormBuilder,
    private readonly session: SessionStorageService
  ) {}

  ngAfterContentInit(): void {
    const data = this.modalService.getInputData() as {
      modalType: string;
      userRole: UserRole;
      editUser: UserResponse;
    };

    this.modalType = data.modalType;
    this.editUser = data.editUser;
    this.userRole = data.userRole;
    this.initUserForm();

    this.isLoading = false;
  }

  toggleShowPasswordReset(): void {
    this.showPasswordReset = !this.showPasswordReset;
  }

  onSubmit(): void {
    if (this.modalType === 'add') {
      this.addUser();
    } else {
      this.putUser();
    }
  }

  initUserForm(): void {
    if (this.modalType === 'add') {
      this.userForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, validateEmail]],
        password: ['', [Validators.required, validatePassword(this.userRole)]],
        role: [
          this.userRole === 'super_admin' ? 'admin' : '',
          Validators.required,
        ],
      });
    } else {
      this.userForm = this.fb.group({
        firstName: this.editUser.firstName,
        lastName: this.editUser.lastName,
        email: this.editUser.email,
        password: [''],
        role: this.editUser.role,
      });
      this.disableDelete = this.editUser.id === this.session.get('id');
    }

  }

  get f(): FormGroup['controls'] {
    return this.userForm.controls;
  }

  addUser(): void {
    const newUser: NewUserRequest = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      role: this.userRole === 'super_admin' ? 'admin' : this.f['role'].value,
    };

    this.usersService
      .register(newUser)
      .pipe(
        take(1),
        catchError((res: HttpErrorResponse) => {
          this.serverFeedback = res.error.message;
          return of(false);
        }),
      )
      .subscribe((user: UserResponse | boolean) => {
        if (user) this.modalService.close('refresh');
      });
  }

  putUser(): void {
    if (this.showPasswordReset) this.changePassword();

    if (!this.formEqualsCurrentUser()) {
      const newUser: NewUserRequest = {
        id: this.editUser.id,
        firstName: this.f['firstName'].value,
        lastName: this.f['lastName'].value,
        email: this.f['email'].value,
        role: this.f['role'].value,
      };

      this.usersService
        .put(newUser)
        .pipe(
          take(1),
          catchError((res: HttpErrorResponse) => {
            this.serverFeedback = res.error.message;
            return of(false);
          }),
        )
        .subscribe((user: UserResponse | boolean) => {
          if (user) this.modalService.close('refresh');
        });
    } else {
      this.closeModal();
    }
  }

  changePassword(): void {
    this.usersService
      .changePassword({
        id: this.editUser.id,
        password: this.f['password'].value,
      })
      .subscribe((user) => {
        if (user) console.log('changed pwd for ', user);
      });
  }

  closeModal(): void {
    if (this.modalType === 'add') {
      this.initUserForm();
    }
    this.serverFeedback = '';
    this.showPasswordReset = false;
    this.modalService.close('none');
  }

  openWarningModal(): void {
    this.modalService.close('delete');
  }

  formEqualsCurrentUser(): boolean {
    const formValues = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      email: this.f['email'].value,
      role: this.f['role'].value,
    };

    const currentValues = {
      firstName: this.editUser.firstName,
      lastName: this.editUser.lastName,
      email: this.editUser.email,
      role: this.editUser.role,
    };

    return isEqual(formValues, currentValues);
  }

  onPaste(event: ClipboardEvent): void {
    const pastedText = event?.clipboardData?.getData('text');
    if (pastedText) {
      event.preventDefault();
      const cleanedText = pastedText.replace(/[\s]/g, '');

      (<HTMLInputElement>document.getElementById('email')).value = cleanedText;
    }
  }

  onFocus(): void {
    this.serverFeedback = '';
  }
}

@NgModule({
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule,
    ErrorFeedbackModule,
  ],
  declarations: [UserModalComponent],
})
export class UserModalModule {}
