import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { OverviewService } from './overview.service';


describe('OverviewService', () => {
  let service: OverviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(OverviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('variables', () => {
    it('baseUrl should be initialised correctly', () => {
      expect(service.baseUrl).toEqual('/api/orders');
    });
    it('endpoint should be initialised correctly', () => {
      expect(service.endpoint).toEqual('/overview');
    });
  });
});
