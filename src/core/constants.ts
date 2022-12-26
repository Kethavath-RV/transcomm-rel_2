export const businessCodeAccountNoMapping: Record<number, AccountNumberType> = {
  1: {
    businessCode: 'AE-9105340',
    paymentMode: 'CA',
    requestType: 'DECLARATION',
    accountNo: '1222978',
  },
  2: {
    businessCode: 'AE-9105341',
    paymentMode: 'CA',
    requestType: 'DECLARATION',
    accountNo: '1222978',
  },
  3: {
    businessCode: 'AE-9105341',
    paymentMode: 'CA',
    requestType: 'CLAIM',
    accountNo: '1222978',
  },
};

export interface AccountNumberType {
  businessCode: string;
  paymentMode: string;
  requestType: string;
  accountNo: string;
}

export interface BusinessAccount {
  businessType: BusinessType;
  businessName: string;
  brokerCustomerCode: number;
  cargoHandlerPremiseCode: string;
}

export enum BusinessType {
  Mainland = 'Mainland',
  FZ = 'FZ',
}

export const EcomBusinessCodeLookup: Record<string, BusinessAccount> = {
  'AE-9105340': {
    businessName: 'The Luxury Closet Inc',
    businessType: BusinessType.Mainland,
    brokerCustomerCode: 196007174,
    cargoHandlerPremiseCode: 'PR-91936',
  },
  'AE-9105341': {
    businessName: 'YOOX NET-A-PORTER GROUP',
    businessType: BusinessType.FZ,
    brokerCustomerCode: 196007174,
    cargoHandlerPremiseCode: 'PR-91936',
  },
};
