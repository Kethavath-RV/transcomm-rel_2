import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { InvoiceParamGuard } from './guards/invoice-param.guard';
import { UserResolver } from './guards/user.resolver';

@NgModule({
  providers: [AuthGuard, AuthService, InvoiceParamGuard, UserResolver],
  imports: [CommonModule, RouterModule, HttpClientModule, ReactiveFormsModule],
})
export class AuthModule {}
