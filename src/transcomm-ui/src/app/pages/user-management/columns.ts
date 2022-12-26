import { ColDef } from '@ag-grid-community/core';

export const usersColumnDefs: ColDef[] = [
  { headerName: 'Email', field: 'email', filter: 'textFilter' },
  {
    headerName: 'First Name',
    field: 'firstName',
    filter: 'textFilter',
  },
  { headerName: 'Last Name', field: 'lastName', filter: 'textFilter' },
  { headerName: 'Role', field: 'role', filter: 'enumFilter' },
  { headerName: 'Locked', field: 'locked', filter: 'booleanFilter' },
];
