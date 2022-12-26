import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ManualRetryRequest, ManualRetryView, OrderView } from 'core/viewModels';
import { Observable } from 'rxjs';
import { AbstractRestService } from '../AbstractRest.service';

@Injectable({
  providedIn: 'root',
})
export class ManualRetryService extends AbstractRestService<
  ManualRetryView,
  OrderView
> {
  constructor(http: HttpClient) {
    super(http);
  }
  public baseUrl = '/api/orders';
  public endpoint = '/retries';

  purgeOrders(data: ManualRetryRequest): Observable<any> {
    const fullUrl = `${this.getFullUrl()}/purge`;
    return this.http.post(fullUrl, data, this.httpOptions);
  }

  retryOrders(data: ManualRetryRequest): Observable<any> {
    const endpoint = `${this.getFullUrl()}/retryMany`;
    return this.http.post(endpoint, data, this.httpOptions);
  }
}
