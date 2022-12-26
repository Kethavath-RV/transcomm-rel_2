import { ColDef } from '@ag-grid-community/core';
import {
    dateFilterParams,
    dateFormatter,
    ecomCodeColumn,
    invoiceNumberColumn,
    orderNumberColumn
} from '../../constants/agProps';

export const retryColumnDefs: ColDef[] = [
  { headerName: 'Identifier', field: 'vcId', filter: 'textFilter' },
  { headerName: 'Contract Type', field: 'contractType', filter: 'textFilter' },
  orderNumberColumn,
  invoiceNumberColumn,
  ecomCodeColumn,
  { headerName: 'Error Code', field: 'errorCode', filter: 'textFilter' },
  { headerName: 'Error Description', field: 'errorDesc', filter: 'textFilter' },
  {
    headerName: 'Time of failure',
    field: 'failDate',
    filter: 'dateFilter',
    filterParams: dateFilterParams,
    valueFormatter: ({ value }: { value: string }): string =>
      dateFormatter(value),
  },
  { headerName: 'Status', field: 'status', filter: 'textFilter' },
];
