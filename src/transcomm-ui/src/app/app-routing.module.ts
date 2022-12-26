import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { OrderDetailModule } from './pages/order-detail/order-detail.module';
import { RolePipe, Routerlinks } from './auth/router-links';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { ErrorFeedbackModule } from './components/error-feedback/error-feedback.module';
import { LoaderModule } from './components/loader/loader.module';
import { RoleGuard } from './auth/guards/role.guard';
import { UserResolver } from './auth/guards/user.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: Routerlinks.login,
    pathMatch: 'full',
  },
  {
    path: Routerlinks.login,
    component: LoginComponent,
    canActivate: [AuthGuard],
    resolve: { user: UserResolver },
  },
  {
    path: Routerlinks.superPassword,
    loadChildren: () =>
      import('./pages/super-admin-password/super-admin-password.module').then(
        (m) => m.SuperAdminPasswordModule,
      ),
    canLoad: [AuthGuard, RoleGuard],
  },
  {
    path: Routerlinks.users,
    loadChildren: () =>
      import('./pages/user-management/user-management.module').then(
        (m) => m.UserManagementModule,
      ),
    canLoad: [AuthGuard, RoleGuard],
  },
  {
    path: Routerlinks.shipments,
    loadChildren: () =>
      import('./pages/shipments/shipments.module').then(
        (m) => m.ShipmentsModule,
      ),
    canLoad: [AuthGuard, RoleGuard],
  },
  {
    path: Routerlinks.cancelled,
    loadChildren: () =>
      import('./pages/cancelled/cancelled.module').then(
        (m) => m.CancelledModule,
      ),
    canLoad: [AuthGuard, RoleGuard],
  },
  {
    path: Routerlinks.returns,
    loadChildren: () =>
      import('./pages/returns/returns.module').then((m) => {
        return m.ReturnsModule;
      }),
    canLoad: [AuthGuard, RoleGuard],
  },
  {
    path: Routerlinks.exceptions,
    loadChildren: () =>
      import('./pages/exceptions/exceptions.module').then(
        (m) => m.ExceptionsModule,
      ),
    canLoad: [AuthGuard, RoleGuard],
  },
  {
    path: Routerlinks.retry,
    loadChildren: () =>
      import('./pages/manual-retry/manual-retry.module').then(
        (m) => m.ManualRetryModule,
      ),
    canLoad: [AuthGuard, RoleGuard],
  },
  {
    path: Routerlinks.tools,
    loadChildren: () =>
      import('./pages/tools/tools.module').then((m) => m.ToolsModule),
    canLoad: [AuthGuard, RoleGuard],
  },
  { path: '**', component: NotFoundComponent, resolve: { user: UserResolver } },
];

@NgModule({
  declarations: [LoginComponent, NotFoundComponent, RolePipe],
  imports: [
    AuthModule,
    OrderDetailModule,
    RouterModule.forRoot(routes),
    ErrorFeedbackModule,
    LoaderModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
