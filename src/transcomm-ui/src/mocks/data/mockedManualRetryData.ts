import { ManualRetryView } from 'core/viewModels';

export const mockedManualRetryData: ManualRetryView = {
  orderNumber: '1',
  invoiceNumber: 'a',
  ecomCode: 'z1a',
  contractType: 'HGV',
  errorCode: '500',
  errorDesc: 'Alles is Kapot',
  failDate: new Date(),
  status: 'Pending',
  retryButton: true,
  contractMethod: 'TGV',
  remark: 'Retry',
};
