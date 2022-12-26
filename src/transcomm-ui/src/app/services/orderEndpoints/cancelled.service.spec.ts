import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CancelledService } from './cancelled.service';


describe('CancelledService', () => {
  let service: CancelledService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(CancelledService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('variables', () => {
    it('baseUrl should be initialised correctly', () => {
      expect(service.baseUrl).toEqual('/api/orders');
    });
    it('endpoint should be initialised correctly', () => {
      expect(service.endpoint).toEqual('/cancelledOrders');
    });
  });
});
