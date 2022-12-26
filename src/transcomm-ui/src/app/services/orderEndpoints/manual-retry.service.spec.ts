import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { mockedManualRetryData } from '../../../mocks/data/mockedManualRetryData';
import { ManualRetryService } from './manual-retry.service';


describe('ManualRetryService', () => {
  let service: ManualRetryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(ManualRetryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('variables', () => {
    it('baseUrl should be initialised correctly', () => {
      expect(service.baseUrl).toEqual('/api/orders');
    });
    it('endpoint should be initialised correctly', () => {
      expect(service.endpoint).toEqual('/retries');
    });
  });

  describe('purgeOrders', () => {
    // These need to be made better (fix return val)
    it('should call BE', (done) => {
      service.purgeOrders({ data: [mockedManualRetryData] });
      done();
    });
  });
  describe('retryOrders', () => {
    // These need to be made better
    it('should call BE', (done) => {
      service.retryOrders({ data: [mockedManualRetryData] });
      done();
    });
  });
});
