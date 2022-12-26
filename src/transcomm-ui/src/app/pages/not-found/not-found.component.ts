import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserResponse } from 'core/viewModels';
import { IRouteLink, Routerlinks } from '../../auth/router-links';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
})
export class NotFoundComponent implements OnInit {
  quicknavlinks: IRouteLink[];
  homeLink: IRouteLink = {
    route: Routerlinks.home,
    label: 'Home',
    icon: '/assets/icons/globe_rgb_red.svg',
  }
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const userResp: UserResponse = this.route.snapshot.data[
      'user'
    ] as UserResponse;
    if (!userResp) {
      this.router.navigate([Routerlinks.home]);
    }

    this.quicknavlinks = [
      {
        route: `/${Routerlinks.shipments}`,
        label: 'Shipments',
        icon: '/assets/icons/intransit_rgb_red.svg',
      },
      {
        route: `/${Routerlinks.users}`,
        label: 'Users',
        icon: '/assets/icons/management_services_rgb_red.svg',
      },
    ];
  }
}
