import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderOverview, OrderView } from 'core/viewModels';
import { AbstractRestService } from '../AbstractRest.service';

@Injectable({
  providedIn: 'root',
})
export class OverviewService extends AbstractRestService<
  OrderOverview,
  OrderView
> {
  constructor(http: HttpClient) {
    super(http);
  }
  public baseUrl = '/api/orders';
  public endpoint = '/overview';
}
