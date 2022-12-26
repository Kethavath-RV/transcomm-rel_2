import { Paginated, UserResponse } from 'core/viewModels';
import { Observable, of } from 'rxjs';

export class MockUsersService {
  getData = (): Observable<Paginated<UserResponse>> => {
    return mockUsersPaginatedData$;
  };
}

export const mockUserResponseData: UserResponse[] = [
  {
    email: 'a@b.cd',
    firstName: 'a',
    lastName: 'b',
    id: '123',
    locked: false,
    role: 'admin',
  },
  {
    email: 'b@b.cd',
    firstName: 'b',
    lastName: 'b',
    id: '124',
    locked: false,
    role: 'editor',
  },
];

export const mockUsersPaginatedData$ = of({
  data: mockUserResponseData,
  numberOfRecords: mockUserResponseData.length,
});
