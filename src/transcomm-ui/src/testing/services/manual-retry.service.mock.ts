import { ManualRetryView, Paginated } from 'core/viewModels';
import { Observable, of } from 'rxjs';

export const mockManualRetryViewData: ManualRetryView[] = [
  {
    ecomCode: 'ecom1',
    invoiceNumber: 'invoice1',
    orderNumber: 'order1',
    contractMethod: 'asdf',
    remark: 'asdf',
  },
  {
    ecomCode: 'ecom2',
    invoiceNumber: 'invoice2',
    orderNumber: 'order2',
    contractMethod: 'asdf',
    remark: 'asdf',
  },
  {
    ecomCode: 'ecom3',
    invoiceNumber: 'invoice3',
    orderNumber: 'order3',
    contractMethod: 'asdf',
    remark: 'asdf',
  },
];

export const mockPaginatedData$ = of({
  data: mockManualRetryViewData,
  numberOfRecords: mockManualRetryViewData.length,
});

export class MockManualRetryService {
  getData = (): Observable<Paginated<ManualRetryView>> => {
    // trigger refresh here?
    return mockPaginatedData$;
  };
}
