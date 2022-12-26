import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CancelledOrderOverview, OrderView } from 'core/viewModels';
import { AbstractRestService } from '../AbstractRest.service';

@Injectable({
  providedIn: 'root',
})
export class CancelledService extends AbstractRestService<
  CancelledOrderOverview,
  OrderView
> {
  constructor(http: HttpClient) {
    super(http);
  }
  public baseUrl = '/api/orders';
  public endpoint = '/cancelledOrders';
}
