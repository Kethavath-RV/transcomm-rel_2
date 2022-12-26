import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { first } from 'rxjs/operators';
import { mockSecretResponse } from '../../mocks/data/mockedSecretResponse';

import { ToolsService } from './tools.service';

describe('ToolsService', () => {
  let service: ToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientModule] });
    service = TestBed.inject(ToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generatesecrets', () => {
    it('should return an observable', (done) => {
      service
        .generateSecrets()
        .pipe(first())
        .subscribe((val) => {
          expect(val).toEqual(mockSecretResponse);
          done();
        });
    });
  });
});
