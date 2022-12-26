import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SecretsResponse } from 'core/datagen-dtos';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  protected httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  generateSecrets(): Observable<SecretsResponse> {
    const fullUrl = `/api/admin/updateSecrets`;
    return this.http.post<SecretsResponse>(fullUrl, {}, this.httpOptions);
  }
}
