import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Paginated } from 'core/viewModels';
import { Observable } from 'rxjs';
import { calculateSkip } from '../helpers/calculateSkip';
import { PrismaOrderByInput, PrismaWhereInput } from '../models/prismaModels';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

export abstract class AbstractRestService<TView, TDetails> {
  abstract baseUrl: string;
  abstract endpoint: string;

  protected httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(protected http: HttpClient) {}

  protected getFullUrl(): string {
    return this.baseUrl + this.endpoint;
  }

  getData(
    searchParams: PrismaWhereInput,
    sortParams: PrismaOrderByInput[],
    page: number,
  ): Observable<Paginated<TView>> {
    const skip = calculateSkip(page);
    const fullUrl = `${this.getFullUrl()}?skip=${skip}`;
    return this.http.post<Paginated<TView>>(
      fullUrl,
      { searchParams, sortParams },
      httpOptions,
    );
  }

  getDetails(id: string): Observable<TDetails> {
    const fullUrl = `${this.baseUrl}/${id}`;
    return this.http.get<TDetails>(fullUrl);
  }
}
