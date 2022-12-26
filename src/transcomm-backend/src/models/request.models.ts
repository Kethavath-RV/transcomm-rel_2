import { Order, Prisma } from '@prisma/client';
import { ContractMethod, UserResponse } from 'core';
import { Request } from 'express';

export interface CreateOrder extends Order {
  addresses: Prisma.AddressCreateInput[];
  eventChain: Prisma.ChainEventCreateInput[];
  orderLine: Prisma.OrderLineCreateInput[];
  houseBills: Prisma.HouseBillCreateInput[];
  movements: Prisma.MovementCreateInput[];
  declarations: Prisma.DeclarationCreateInput[];
  delivered: Prisma.DeliveredCreateInput[];
  invoices: Prisma.InvoiceCreateInput[];
}

export interface UserRequest extends Request {
  user: UserEnriched;
}

export interface UserEnriched extends UserResponse {
  passwordChangeRequired: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthToken {
  issuer: string;
  email: string;
  sub: string;
}

export interface SortMap {
  [sortBy: string]: Prisma.SortOrder;
}

export interface OrderExceptionQueryRequest {
  searchParams?: Prisma.OrderExceptionOverviewWhereInput;
  sortParams?:
    | Prisma.OrderExceptionOverviewOrderByInput
    | Prisma.OrderExceptionOverviewOrderByInput[];
}

export interface OrderQueryRequest {
  searchParams?: Prisma.OrderOverviewWhereInput;
  sortParams?:
    | Prisma.OrderOverviewOrderByInput
    | Prisma.OrderOverviewOrderByInput[];
}

export interface CancelledOrderQueryRequest {
  searchParams?: Prisma.CancelledOrderOverviewWhereInput;
  sortParams?:
    | Prisma.CancelledOrderOverviewOrderByInput
    | Prisma.CancelledOrderOverviewOrderByInput[];
}

export interface ReturnedOrderQueryRequest {
  searchParams?: Prisma.ReturnedOrderOverviewWhereInput;
  sortParams?:
    | Prisma.ReturnedOrderOverviewOrderByInput
    | Prisma.ReturnedOrderOverviewOrderByInput[];
}

export interface ManualRetryQueryRequest {
  searchParams?: Prisma.ManualRetryViewWhereInput;
  sortParams?:
    | Prisma.ManualRetryViewOrderByInput
    | Prisma.ManualRetryViewOrderByInput[];
}

export interface RetryHyperledgerRequest extends Request {
  user: UserResponse;
  contractMethod: ContractMethod;
}

export interface PurgeRetriesRequest {
  data: Prisma.ManualRetryViewOrderNumberInvoiceNumberEcomCodeContractMethodCompoundUniqueInput[];
}

export interface RetryManyRequest extends Request {
  user: UserResponse;
  data: Prisma.ManualRetryViewOrderNumberInvoiceNumberEcomCodeContractMethodCompoundUniqueInput[];
}
