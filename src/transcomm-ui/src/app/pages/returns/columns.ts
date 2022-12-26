import { ColDef } from '@ag-grid-community/core';
import {
    batchIdColumn,
    dateFilterParams,
    dateFormatter,
    declarationNumberColumn,
    declarationStatusColumn,
    declarationTypeColumn,
    ecomCodeColumn,
    invoiceNumberColumn,
    lastActionDateColumn,
    numberOfItemsColumn,
    orderDateColumn,
    orderNumberColumn
} from '../../constants/agProps';

export const returnedColumnDefs: ColDef[] = [
  ecomCodeColumn,
  orderNumberColumn,
  invoiceNumberColumn,
  orderDateColumn,
  lastActionDateColumn,
  {
    headerName: 'Return Date',
    field: 'returnDate',
    filter: 'dateFilter',
    filterParams: dateFilterParams,
    valueFormatter: ({ value }: { value: string }): string =>
      dateFormatter(value),
  },
  {
    ...numberOfItemsColumn,
    field: 'numberOfReturnItems',
  },
  { headerName: 'Return Reason', field: 'returnReason', filter: 'textFilter' },
  declarationNumberColumn,
  batchIdColumn,
  declarationStatusColumn,
  declarationTypeColumn,
  {
    headerName: 'Return Request No.',
    field: 'returnRequestNo',
    filter: 'textFilter',
  },
  {
    headerName: 'Previous Transport Document',
    field: 'prevTransportDocNo',
    filter: 'textFilter',
  },
  {
    headerName: 'Return Justification',
    field: 'returnJustification',
    filter: 'textFilter',
  },
];
