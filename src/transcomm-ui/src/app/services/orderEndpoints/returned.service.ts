import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderView, ReturnedOrderOverview } from 'core/viewModels';
import { AbstractRestService } from '../AbstractRest.service';

@Injectable({
  providedIn: 'root',
})
export class ReturnedService extends AbstractRestService<
  ReturnedOrderOverview,
  OrderView
> {
  constructor(protected http: HttpClient) {
    super(http);
  }
  public baseUrl = '/api/orders';
  public endpoint = '/returnedOrders';
}
