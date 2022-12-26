import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ReturnedService } from './returned.service';

describe('ReturnedService', () => {
  let service: ReturnedService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(ReturnedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('variables', () => {
    it('baseUrl should be initialised correctly', () => {
      expect(service.baseUrl).toEqual('/api/orders');
    });
    it('endpoint should be initialised correctly', () => {
      expect(service.endpoint).toEqual('/returnedOrders');
    });
  });
});
