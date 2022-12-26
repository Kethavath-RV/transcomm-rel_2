import { ColDef } from '@ag-grid-community/core';
import {
  batchIdColumn,
  dateFilterParams,
  dateFormatter,
  declarationStatusColumn,
  ecomCodeColumn,
  lastActionDateColumn,
  orderDateColumn,
  orderNumberColumn,
} from '../../app/constants/agProps';
import { MockAgLinkComponent } from '../components/ag-link.component.mock';
import { MockAgLockerComponent } from '../components/ag-locker.component.mock';

const invoiceNumberColumn = {
  headerName: 'Invoice No.',
  field: 'invoiceNumber',
  filter: 'textFilter',
  cellRendererFramework: MockAgLinkComponent,
};

export const mockExceptionColumnDefs: ColDef[] = [
  {
    headerName: 'Locked By',
    field: 'lockedBy',
    filter: 'textFilter',
    cellRendererFramework: MockAgLockerComponent,
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
