/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Subject } from 'rxjs';
import { ApiDataParams } from 'src/app/models/prismaModels';

export class MockAggridService {
  activePage = 1;
  numberOfPages = 1;
  numberOfRows = 2;
  numberPerPage = 10;

  refreshDataSubject = new Subject<ApiDataParams>();
  refreshData$ = this.refreshDataSubject.asObservable();

  
  
  clearFilters = () => {
    // trigger refresh here?
    return null;
  };
}
