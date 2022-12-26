import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlTree } from '@angular/router';
import { UserRole } from 'core/viewEnums';
import { Observable } from 'rxjs';
import { allowedLinksByRole } from '../router-links';
import { AuthService } from '../services/auth.service';
import { SessionStorageService } from '../services/session/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanLoad {
  constructor(
    private readonly session: SessionStorageService,
    private readonly auth: AuthService,
  ) {}
  
  canLoad(
    route: Route,
  ): boolean | UrlTree | Observable<boolean> | Observable<UrlTree> {
    const userRole: UserRole = this.session.get('role') as UserRole;
    const allowedLinks = allowedLinksByRole(userRole);

    return allowedLinks.includes(route.path) || this.auth.getRerouteUrlTree();
  }
}
