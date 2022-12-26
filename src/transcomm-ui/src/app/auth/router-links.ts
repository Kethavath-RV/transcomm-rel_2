import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from 'core/viewEnums';
import { SessionStorageService } from './services/session/session-storage.service';

export interface IRouteLink {
  route: string;
  label: string;
  icon?: string;
}

export const Routerlinks = {
  home: '',
  login: 'login',
  users: 'users',
  cancelled: 'cancelled',
  exceptions: 'exceptions',
  shipments: 'shipments',
  returns: 'returns',
  retry: 'retry',
  invoiceParam: ':ecomCode/:orderId/:invoiceId',
  superPassword: 'reset-password',
  tools: 'tools',
};

export const userLinks: IRouteLink[] = [
  { route: Routerlinks.exceptions, label: 'Exceptions' },
  { route: Routerlinks.returns, label: 'Returns' },
  { route: Routerlinks.cancelled, label: 'Cancelled' },
  { route: Routerlinks.shipments, label: 'All Shipments' },
];

export const adminLinks: IRouteLink[] = [
  ...userLinks,
  { route: Routerlinks.users, label: 'User Management' },
  { route: Routerlinks.retry, label: 'Manual Retry' },
  { route: Routerlinks.tools, label: 'Tools' },
];

export const superAdminLinks: IRouteLink[] = [
  { route: Routerlinks.superPassword, label: 'Reset Password' },
  { route: Routerlinks.users, label: 'User Management' },
];

export const allowedLinksByRole = (role: UserRole): string[] => {
  switch (role) {
    case 'super_admin':
      return superAdminLinks.map((link) => link.route);
    case 'admin':
      return adminLinks.map((link) => link.route);
    default:
      return userLinks.map((link) => link.route);
  }
};

@Pipe({
  name: 'role',
  pure: true,
})
export class RolePipe implements PipeTransform {
  constructor(private readonly session: SessionStorageService) {}

  transform(links: IRouteLink[]): IRouteLink[] {
    const userRole = this.session.get('role') as UserRole;
    const allowedLinks = allowedLinksByRole(userRole);
    return links.filter((link) =>
      allowedLinks.includes(link.route.substring(1)),
    );
  }
}
