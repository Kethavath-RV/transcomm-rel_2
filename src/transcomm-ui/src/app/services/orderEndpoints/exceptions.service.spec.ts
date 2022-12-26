import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ExceptionsService } from './exceptions.service';


describe('ExceptionsService', () => {
  let service: ExceptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(ExceptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
