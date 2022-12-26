import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { compareFunction } from '../../mocks/helpers/helperfunctions';
import {
  GenericTestDetails,
  GenericTestView,
} from '../../mocks/testEndpoints/testEndpointModels';
import {
  testDetailsData,
  testViewData,
} from '../../mocks/testEndpoints/testEndpointObjects';
import { AbstractRestService } from './AbstractRest.service';

@Injectable({
  providedIn: 'root',
})
class TestAbstractRestService extends AbstractRestService<
  GenericTestView,
  GenericTestDetails
> {
  constructor(http: HttpClient) {
    super(http);
  }
  baseUrl = '/api/test';
  endpoint = '/service';
}

describe('AbstractRestService', () => {
  let service: TestAbstractRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(TestAbstractRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('variables', () => {
    it('baseUrl should be initialised correctly', () => {
      expect(service.baseUrl).toEqual('/api/test');
    });
    it('endpoint should be initialised correctly', () => {
      expect(service.endpoint).toEqual('/service');
    });
  });

  describe('function getData', () => {
    it('gets all data with no sorting', (done) => {
      service
        .getData({}, [{}], 1)
        .pipe(first())
        .subscribe((res) => {
          expect(res.data).toEqual(testViewData);
          expect(res.numberOfRecords).toEqual(testViewData.length);
          done();
        });
    });
    it('gets data with filtering', (done) => {
      const singleRecord: GenericTestView = testViewData[0];
      // ToDo: Check MSW endpoint working correctly for this <-- RJ SQ is complaining
      service
        .getData({ id: { contains: singleRecord.id } }, [{}], 1)
        .pipe(first())
        .subscribe((res) => {
          expect(res.data).toEqual(testViewData);
          expect(res.numberOfRecords).toEqual(testViewData.length);
          done();
        });
    });
    it('sorts data', (done) => {
      service
        .getData({}, [{ id: 'desc' }], 1)
        .pipe(first())
        .subscribe((res) => {
          const expectedOrder = testViewData.sort((a, b) =>
            compareFunction(a, b, 'id', 'desc'),
          );
          expect(res.data).toEqual(expectedOrder);
          done();
        });
    });
  });

  describe('function getDetails', () => {
    it('is calls backend with correct values', (done) => {
      const id = '1';
      const detailsObj = testDetailsData.find((obj) => obj.id === id);
      service
        .getDetails(id)
        .pipe(first())
        .subscribe((res) => {
          expect(res).toEqual(detailsObj);
          done();
        });
    });
    it('is calls backend with missing id', (done) => {
      const id = '';
      service
        .getDetails(id)
        .pipe(catchError((err) => of(err)))
        .subscribe((res) => {
          expect(res.status).toEqual(404);
          expect(res.error.message).toEqual('id not found');
          done();
        });
    });
    it('is calls backend with wrong id', (done) => {
      const id = 'does not exist';
      service
        .getDetails(id)
        .pipe(catchError((err) => of(err)))
        .subscribe((res) => {
          expect(res.status).toEqual(404);
          expect(res.error.message).toEqual('id not found');
          done();
        });
    });
  });
});
