import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserResponse } from 'core/viewModels';
import { SessionStorageService } from '../../auth/services/session/session-storage.service';
import {
  getPasswordErrorMessage,
  validatePassword,
} from '../../helpers/validate-password';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-super-admin-password',
  templateUrl: './super-admin-password.component.html',
  styleUrls: ['./super-admin-password.component.css'],
})
export class SuperAdminPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  showValidation = false;
  submitted = false;
  feedback = {
    password: '',
    confirmPassword: '',
  };
  valid: boolean;
  userProfile: UserResponse;

  constructor(
    private userService: UsersService,
    private formBuilder: FormBuilder,
    private session: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.formBuilder.group({
      password: [''],
      passwordConfirm: [''],
    });
    this.userProfile = this.session.getUserProfile();
  }

  get f(): FormGroup['controls'] {
    return this.passwordForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.passwordIsValid('password', this.f.password.value)) {
      this.valid = false;
      return;
    }

    if (this.f.password.value !== this.f.passwordConfirm.value) {
      this.feedback.confirmPassword = 'Passwords must match!';
      this.valid = false;
      return;
    }

    this.userService
      .changePassword({
        id: this.userProfile.id,
        password: this.f.password.value,
      })
      .subscribe(
        () => {
          this.passwordForm = this.formBuilder.group({
            password: [''],
            passwordConfirm: [''],
          });
          alert('Password changed successfully');
        },
        () => {
          alert('Password not changed');
        },
      );
  }

  onFocusHandler(): void {
    this.submitted = false;
    if (this.f.password.value !== '') {
      this.f.password.setErrors(null);
      this.feedback['password'] = null;
    }
    if (this.f.passwordConfirm.value !== '') {
      this.f.passwordConfirm.setErrors(null);
      this.feedback['confirmPassword'] = null;
    }
  }

  showFeedback(field: string): boolean {
    if (this.feedback[field]) {
      return true;
    }
    return false;
  }

  passwordIsValid(field: string, fieldValue: string): boolean {
    if (validatePassword(fieldValue, 'admin')) {
      this.feedback[field] = null;
      return true;
    } else {
      this.feedback[field] = getPasswordErrorMessage('admin');
      return false;
    }
  }
}
