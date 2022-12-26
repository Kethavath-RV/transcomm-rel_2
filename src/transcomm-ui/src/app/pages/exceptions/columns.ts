import { ColDef } from '@ag-grid-community/core';
import { AgLockerComponent } from '../../components/aggrid/ag-locker/ag-locker.component';
import {
  batchIdColumn,
  dateFilterParams,
  dateFormatter,
  declarationStatusColumn,
  ecomCodeColumn,
  invoiceNumberColumn,
  lastActionDateColumn,
  orderDateColumn,
  orderNumberColumn,
} from '../../constants/agProps';

export const exceptionColumnDefs: ColDef[] = [
  {
    headerName: 'Locked By',
    field: 'lockedBy',
    filter: 'textFilter',
    cellRendererFramework: AgLockerComponent,
  },
  ecomCodeColumn,
  orderNumberColumn,
  invoiceNumberColumn,
  orderDateColumn,
  lastActionDateColumn,
  {
    headerName: 'Declaration No.',
    field: 'declarationReference',
    filter: 'textFilter',
  },
  batchIdColumn,
  declarationStatusColumn,
  {
    headerName: 'Rejected At',
    field: 'rejectionDate',
    filter: 'dateFilter',
    filterParams: dateFilterParams,
    valueFormatter: ({ value }: { value: string }): string =>
      dateFormatter(value),
  },
  { headerName: 'Flight No.', field: 'flightNumber', filter: 'textFilter' },
  { headerName: 'Airway Bill No.', field: 'transport', filter: 'textFilter' },
  { headerName: 'MAWB', field: 'mawb', filter: 'textFilter' },
];
