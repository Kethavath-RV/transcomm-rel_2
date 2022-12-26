import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ErrorFeedbackModule } from '../../components/error-feedback/error-feedback.module';

import { SuperAdminPasswordComponent } from './super-admin-password.component';

@NgModule({
  declarations: [SuperAdminPasswordComponent],
  imports: [
    CommonModule,
    ErrorFeedbackModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: SuperAdminPasswordComponent,
      },
    ]),
  ],
})
export class SuperAdminPasswordModule {}
