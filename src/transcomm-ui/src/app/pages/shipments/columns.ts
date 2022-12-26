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
  orderNumberColumn,
} from '../../constants/agProps';

export const allShipmentsColumnDefs: ColDef[] = [
  ecomCodeColumn,
  orderNumberColumn,
  invoiceNumberColumn,
  { headerName: 'Order Status', field: 'orderStatus', filter: 'enumFilter' },
  orderDateColumn,
  lastActionDateColumn,
  { headerName: 'Airway Bill No.', field: 'transport', filter: 'textFilter' },
  numberOfItemsColumn,
  declarationNumberColumn,
  batchIdColumn,
  declarationStatusColumn,
  declarationTypeColumn,
  { headerName: 'Claim No.', field: 'claimNumber', filter: 'textFilter' },
  {
    headerName: 'Claim Request Date',
    field: 'claimRequestDate',
    filter: 'dateFilter',
    filterParams: dateFilterParams,
    valueFormatter: ({ value }: { value: string }): string =>
      dateFormatter(value),
  },
  { headerName: 'Claim Status', field: 'claimStatus', filter: 'textFilter' },
  { headerName: 'Claim Type', field: 'claimType', filter: 'textFilter' },
];
