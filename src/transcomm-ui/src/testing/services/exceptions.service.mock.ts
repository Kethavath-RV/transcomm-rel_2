import { ExceptionOverview, Paginated } from 'core/viewModels';
import { Observable, of } from 'rxjs';

export class MockExceptionsService {
  getData = (): Observable<Paginated<ExceptionOverview>> => {
    return mockExceptionsPaginatedData$;
  };
}

export const mockExceptionOverviewData: ExceptionOverview[] = [
  {
    ecomCode: 'ecom1',
    invoiceNumber: 'invoice1',
    declarationStatus: 'a',
    batchId: 'asd',
    declarationReference: 'asd',
    flightNumber: 'asd',
    locked: false,
    mawb: 'asdf',
    transport: 'asd',
    orderNumber: 'order1',
  },
  {
    ecomCode: 'ecom2',
    invoiceNumber: 'invoice2',
    declarationStatus: 'a',
    batchId: 'asd',
    declarationReference: 'asd',
    flightNumber: 'asd',
    locked: false,
    mawb: 'asdf',
    transport: 'asd',
    orderNumber: 'order2',
  },
  {
    ecomCode: 'ecom3',
    invoiceNumber: 'invoice3',
    declarationStatus: 'a',
    batchId: 'asd',
    declarationReference: 'asd',
    flightNumber: 'asd',
    locked: false,
    mawb: 'asdf',
    transport: 'asd',
    orderNumber: 'order3',
  },
];

export const mockExceptionsPaginatedData$ = of({
  data: mockExceptionOverviewData,
  numberOfRecords: mockExceptionOverviewData.length,
});
