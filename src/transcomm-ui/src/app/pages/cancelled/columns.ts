import { ColDef } from '@ag-grid-community/core';
import {
  dateFilterParams,
  dateFormatter,
  ecomCodeColumn,
  invoiceNumberColumn,
  lastActionDateColumn,
  numberOfItemsColumn,
  orderDateColumn,
  orderNumberColumn,
} from '../../constants/agProps';

export const cancelledColumnDefs: ColDef[] = [
  ecomCodeColumn,
  orderNumberColumn,
  invoiceNumberColumn,
  orderDateColumn,
  lastActionDateColumn,
  {
    headerName: 'Cancellation Date',
    field: 'cancelDate',
    filter: 'dateFilter',
    filterParams: dateFilterParams,
    valueFormatter: ({ value }: { value: string }): string =>
      dateFormatter(value),
  },
  numberOfItemsColumn,
  {
    headerName: 'Cancellation Reason',
    field: 'cancellationReason',
    filter: 'textFilter',
  },
];
