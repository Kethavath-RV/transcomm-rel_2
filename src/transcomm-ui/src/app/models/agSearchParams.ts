type SearchTypeText = {
  contains?: string | unknown;
  equals?: string | unknown;
  not?: string | unknown;
  startsWith?: string | unknown;
  endsWith?: string | unknown;
};

type SearchTypeNumber = {
  equals?: number | unknown;
  not?: number | unknown;
  lt?: number | unknown;
  lte?: number | unknown;
  gt?: number | unknown;
  gte?: number | unknown;
};

type SearchTypeEnum = {
  equals?: string;
  in?: string[];
  notIn?: string[];
  not?: string;
};

type SearchTypeDate = {
  contains?: Date | unknown;
  equals?: Date | unknown;
  not?: Date | unknown;
  gte?: Date | unknown;
  lt?: Date | unknown;
};

export type SortParams = { [x: string]: string }[];

export type OrderSearchParams = {
  ecomCode?: SearchTypeText;
  orderNumber?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  orderStatus?: SearchTypeEnum;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  transport?: SearchTypeText;
  numberOfItems?: SearchTypeNumber;
  declarationNumber?: SearchTypeText;
  batchId?: SearchTypeText;
  declarationStatus?: SearchTypeText;
  declarationType?: SearchTypeText;
  claimNumber?: SearchTypeText;
  claimRequestDate?: SearchTypeDate;
  claimStatus?: SearchTypeText;
  claimType?: SearchTypeText;
  AND?: OrderSearchType[];
  OR?: OrderSearchType[];
  NOT?: OrderSearchType[];
};

export type OrderSearchType = {
  ecomCode?: SearchTypeText;
  orderNumber?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  orderStatus?: SearchTypeText;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  transport?: SearchTypeText;
  numberOfItems?: SearchTypeNumber;
  declarationNumber?: SearchTypeText;
  batchId?: SearchTypeText;
  declarationStatus?: SearchTypeText;
  declarationType?: SearchTypeText;
  claimNumber?: SearchTypeText;
  claimRequestDate?: SearchTypeDate;
  claimStatus?: SearchTypeText;
  claimType?: SearchTypeText;
};

export const emptyOrderSearchparams = {
  ecomCode: {
    contains: '',
  },
  orderNumber: {
    contains: '',
  },
  invoiceNumber: {
    contains: '',
  },
  orderStatus: {
    equals: undefined,
  },
  orderDate: {
    gte: undefined,
    lt: undefined,
  },
  lastActionDate: {
    gte: undefined,
    lt: undefined,
  },
  transport: {
    contains: '',
  },
  numberOfItems: {
    equals: undefined,
  },
  declarationNumber: {
    contains: '',
  },
  batchId: {
    contains: '',
  },
  declarationStatus: {
    contains: '',
  },
  declarationType: {
    contains: '',
  },
  claimNumber: {
    contains: '',
  },
  claimRequestDate: {
    gte: undefined,
    lt: undefined,
  },
  claimStatus: {
    contains: '',
  },
  claimType: {
    contains: '',
  },
};

export type ExceptionSearchParams = {
  lockedBy?: SearchTypeText;
  ecomCode?: SearchTypeText;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  orderNumber?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  batchId?: SearchTypeText;
  declarationReference?: SearchTypeText;
  declarationStatus?: SearchTypeText;
  rejectionDate?: SearchTypeDate;
  flightNumber?: SearchTypeText;
  transport?: SearchTypeText;
  mawb?: SearchTypeText;
  AND?: ExceptionSearchType[];
  OR?: ExceptionSearchType[];
  NOT?: ExceptionSearchType[];
};

export type ExceptionSearchType = {
  lockedBy?: SearchTypeText;
  ecomCode?: SearchTypeText;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  orderNumber?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  batchId?: SearchTypeText;
  declarationReference?: SearchTypeText;
  declarationStatus?: SearchTypeText;
  rejectionDate?: SearchTypeDate;
  flightNumber?: SearchTypeText;
  transport?: SearchTypeText;
  mawb?: SearchTypeText;
};

export const emptyExceptionSearchparams: ExceptionSearchParams = {
  lockedBy: {
    contains: '',
  },
  ecomCode: {
    contains: '',
  },
  orderDate: {
    gte: undefined,
    lt: undefined,
  },
  lastActionDate: {
    gte: undefined,
    lt: undefined,
  },
  orderNumber: {
    contains: '',
  },
  invoiceNumber: {
    contains: '',
  },
  batchId: {
    contains: '',
  },
  declarationReference: {
    contains: '',
  },
  declarationStatus: {
    contains: '',
  },
  rejectionDate: {
    gte: undefined,
    lt: undefined,
  },
  flightNumber: {
    contains: '',
  },
  transport: {
    contains: '',
  },
  mawb: {
    contains: '',
  },
};

export type CancelledSearchParams = {
  ecomCode?: SearchTypeText;
  orderNumber?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  cancelDate?: SearchTypeDate;
  numberOfItems?: SearchTypeNumber;
  cancellationReason?: SearchTypeText;
  AND?: CancelledSearchType[];
  OR?: CancelledSearchType[];
  NOT?: CancelledSearchType[];
};

export type CancelledSearchType = {
  ecomCode?: SearchTypeText;
  orderNumber?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  cancelDate?: SearchTypeDate;
  numberOfItems?: SearchTypeNumber;
  cancellationReason?: SearchTypeText;
};

export const emptyCancelledSearchparams: CancelledSearchParams = {
  ecomCode: {
    contains: '',
  },
  orderNumber: {
    contains: '',
  },
  invoiceNumber: {
    contains: '',
  },
  orderDate: {
    gte: undefined,
    lt: undefined,
  },
  lastActionDate: {
    gte: undefined,
    lt: undefined,
  },
  cancelDate: {
    gte: undefined,
    lt: undefined,
  },
  numberOfItems: {
    equals: undefined,
  },
  cancellationReason: {
    contains: '',
  },
};

export type ReturnedSearchParams = {
  orderNumber?: SearchTypeText;
  ecomCode?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  returnDate?: SearchTypeDate;
  numberOfReturnItems?: SearchTypeNumber;
  returnReason?: SearchTypeText;
  declarationNumber?: SearchTypeText;
  batchId?: SearchTypeText;
  declarationStatus?: SearchTypeText;
  declarationType?: SearchTypeText;
  returnRequestNo?: SearchTypeText;
  prevTransportDocNo?: SearchTypeText;
  returnJustification?: SearchTypeText;
  AND?: ReturnedSearchType[];
  OR?: ReturnedSearchType[];
  NOT?: ReturnedSearchType[];
};

export type ReturnedSearchType = {
  orderNumber?: SearchTypeText;
  ecomCode?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  orderDate?: SearchTypeDate;
  lastActionDate?: SearchTypeDate;
  returnDate?: SearchTypeDate;
  numberOfReturnItems?: SearchTypeNumber;
  returnReason?: SearchTypeText;
  declarationNumber?: SearchTypeText;
  batchId?: SearchTypeText;
  declarationStatus?: SearchTypeText;
  declarationType?: SearchTypeText;
  returnRequestNo?: SearchTypeText;
  prevTransportDocNo?: SearchTypeText;
  returnJustification?: SearchTypeText;
};

export const emptyReturnedSearchparams: ReturnedSearchParams = {
  ecomCode: {
    contains: '',
  },
  orderNumber: {
    contains: '',
  },
  invoiceNumber: {
    contains: '',
  },
  orderDate: {
    gte: undefined,
    lt: undefined,
  },
  lastActionDate: {
    gte: undefined,
    lt: undefined,
  },
  returnDate: {
    gte: undefined,
    lt: undefined,
  },
  numberOfReturnItems: {
    equals: undefined,
  },
  returnReason: {
    contains: '',
  },
  declarationNumber: {
    contains: '',
  },
  batchId: {
    contains: '',
  },
  declarationStatus: {
    contains: '',
  },
  declarationType: {
    contains: '',
  },
  returnRequestNo: {
    contains: '',
  },
  prevTransportDocNo: {
    contains: '',
  },
  returnJustification: {
    contains: '',
  },
};

export type ManualRetrySearchParams = {
  contractType?: SearchTypeText;
  contractMethod?: SearchTypeText;
  orderNumber?: SearchTypeText;
  invoiceNumber?: SearchTypeText;
  ecomCode?: SearchTypeText;
  errorCode?: SearchTypeText;
  errorDesc?: SearchTypeText;
  failDate?: SearchTypeDate;
  status?: SearchTypeText;
  errorMessage?: SearchTypeText;
  AND?: ExceptionSearchType[];
  OR?: ExceptionSearchType[];
  NOT?: ExceptionSearchType[];
};

export const emptyManualRetrySearchParams: ManualRetrySearchParams = {
  contractType: {
    contains: '',
  },
  contractMethod: {
    contains: '',
  },
  ecomCode: {
    contains: '',
  },
  orderNumber: {
    contains: '',
  },
  invoiceNumber: {
    contains: '',
  },
  errorCode: {
    contains: '',
  },
  errorDesc: {
    contains: '',
  },
  failDate: {
    gte: undefined,
    lt: undefined,
  },
  status: {
    contains: '',
  },
  errorMessage: {
    contains: '',
  },
};

export type UsersSearchParams = {
  id?: SearchTypeText;
  email?: SearchTypeText;
  firstName?: SearchTypeText;
  lastName?: SearchTypeText;
  role?: SearchTypeText;
  AND?: UsersSearchType[];
  OR?: UsersSearchType[];
  NOT?: UsersSearchType[];
};

type UsersSearchType = {
  id?: SearchTypeText;
  email?: SearchTypeText;
  firstName?: SearchTypeText;
  lastName?: SearchTypeText;
  role?: SearchTypeText;
};

export const emptyUsersSearchparams: UsersSearchParams = {
  id: {
    contains: '',
  },
  email: {
    contains: '',
  },
  firstName: {
    contains: '',
  },
  lastName: {
    contains: '',
  },
  role: {
    equals: undefined,
  },
};
