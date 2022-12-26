import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import { validateEmail } from '../../validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isJittering = false;
  serverFeedback = '';

  isLoading = true;
  private readonly destroy$ = new Subject();

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Init form
    this.loginForm = this.fb.group({
      email: ['', validateEmail],
      password: [''],
    });

    // Listen for login attempt result and
    this.authService.loginSuccessful$
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.warn({ err });
          return of(false);
        }),
      )
      .subscribe((validLogin) => {
        if (!validLogin && this.loginForm.valid) {
          this.isJittering = true;
          this.serverFeedback =
            'Unable to login. Please check your email and password.';
          setTimeout(() => (this.isJittering = false), 1000);
        }
        this.isLoading = false;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f(): FormGroup['controls'] {
    return this.loginForm.controls;
  }

  login(): void {
    this.serverFeedback = '';
    this.authService.login({
      email: this.f.email.value,
      password: this.f.password.value,
    });
  }
}
