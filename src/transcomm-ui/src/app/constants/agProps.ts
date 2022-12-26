import { AgLinkComponent } from '../components/aggrid/ag-link/ag-link.component';

export const dateFormatter = (value: string): string => {
  return value
    ? new Date(value).toLocaleDateString('en-GB', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : '-';
};

export const dateFilterParams = {
  inRangeInclusive: true,
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string): number => {
    if (cellValue === null) {
      return 0;
    }
    // TODO TOBIAS: GET RIGHT LOCALIZATION +02:00 is WRONG
    const cellDate = new Date(`${cellValue.substring(0, 10)}T00:00:00+02:00`);
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    } else if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  },
};

export const ecomCodeColumn = {
  headerName: 'Ecom Code',
  field: 'ecomCode',
  filter: 'textFilter',
};

export const orderNumberColumn = {
  headerName: 'Order ID',
  field: 'orderNumber',
  filter: 'textFilter',
};

export const invoiceNumberColumn = {
  headerName: 'Invoice No.',
  field: 'invoiceNumber',
  filter: 'textFilter',
  cellRendererFramework: AgLinkComponent,
};

export const numberOfItemsColumn = {
  headerName: 'No. of Items',
  field: 'numberOfItems',
  filter: 'numberFilter',
};

export const orderDateColumn = {
  headerName: 'Order Date',
  field: 'orderDate',
  filter: 'dateFilter',
  filterParams: dateFilterParams,
  valueFormatter: ({ value }: { value: string }): string =>
    dateFormatter(value),
};

export const lastActionDateColumn = {
  headerName: 'Last Action Date',
  field: 'lastActionDate',
  filter: 'dateFilter',
  filterParams: dateFilterParams,
  valueFormatter: ({ value }: { value: string }): string =>
    dateFormatter(value),
};

export const declarationNumberColumn = {
  headerName: 'Declaration No.',
  field: 'declarationNumber',
  filter: 'textFilter',
};

export const declarationStatusColumn = {
  headerName: 'Declaration Status',
  field: 'declarationStatus',
  filter: 'textFilter',
};

export const declarationTypeColumn = {
  headerName: 'Declaration Type',
  field: 'declarationType',
  filter: 'textFilter',
};

export const batchIdColumn = {
  headerName: 'Batch ID',
  field: 'batchId',
  filter: 'textFilter',
};
