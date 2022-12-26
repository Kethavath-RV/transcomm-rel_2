import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { UserResponse } from 'core/viewModels';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  adminLinks,
  IRouteLink,
  Routerlinks,
  superAdminLinks,
  userLinks,
} from '../../auth/router-links';
import { AuthService } from '../../auth/services/auth.service';
import { SessionStorageService } from '../../auth/services/session/session-storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit, OnDestroy {
  admin = false;
  userlinks: IRouteLink[] = userLinks;
  adminlinks: IRouteLink[] = adminLinks;
  superAdminlinks: IRouteLink[] = superAdminLinks;
  homeLink = Routerlinks.home;

  navlinks: IRouteLink[] = [];
  private unsubscribe$ = new Subject();
  constructor(
    private authService: AuthService,
    private readonly session: SessionStorageService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService.loginSuccessful$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isValid) => {
        if (!isValid) {
          this.navlinks = [];
        } else {
          this.updateNavlinks();
        }
        this.cd.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.complete();
  }

  updateNavlinks(): void {
    const userProfile: UserResponse = this.session.getUserProfile();

    if (userProfile.id === '') {
      this.navlinks = [];
    } else if (userProfile.role === 'admin') {
      this.navlinks = this.adminlinks;
    } else if (userProfile.role === 'super_admin') {
      this.navlinks = this.superAdminlinks;
    } else {
      this.navlinks = this.userlinks;
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
