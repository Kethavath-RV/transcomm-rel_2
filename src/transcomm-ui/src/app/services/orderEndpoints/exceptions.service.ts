import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Amendment } from 'core/amendments';
import { ExceptionOverview, OrderView } from 'core/viewModels';
import { Observable } from 'rxjs';
import { InvoiceParams } from 'src/app/models/auth.interface';
import { AbstractRestService } from '../AbstractRest.service';

@Injectable({
  providedIn: 'root',
})
export class ExceptionsService extends AbstractRestService<
  ExceptionOverview,
  OrderView
> {
  constructor(http: HttpClient) {
    super(http);
  }
  public baseUrl = '/api/orders';
  public endpoint = '/exceptions';

  // RJ -- these three definitely need to be here. change request BE for cleaner endpoint at least: /api/orders/exceptions/ {whatever else}

  changeOrderLock(isLocking: boolean, params: InvoiceParams): Observable<any> {
    return isLocking ? this.lockOrder(params) : this.unlockOrder(params);
  }

  amendOrder(amendmentParams: Amendment): Observable<OrderView> {
    const endpoint = `${this.baseUrl}/amendment`;
    return this.http.post<OrderView>(
      endpoint,
      amendmentParams,
      this.httpOptions,
    );
  }
  private lockOrder(
    params: InvoiceParams,
  ): Observable<{ message: string; email: string }> {
    const endpoint = `${this.baseUrl}/${params.ecomBusinessCode}/${params.orderNumber}/${params.invoiceNumber}/lock`;
    return this.http.post<{ message: string; email: string }>(
      endpoint,
      {},
      this.httpOptions,
    );
  }

  // RJ - nulls?
  private unlockOrder(params: InvoiceParams): Observable<null> {
    const endpoint = `${this.baseUrl}/${params.ecomBusinessCode}/${params.orderNumber}/${params.invoiceNumber}/unlock`;
    return this.http.post<null>(endpoint, {}, this.httpOptions);
  }
}
