import { Prisma } from '@prisma/client';
import { ContractMethod } from 'core';

export function closeManualRetryView(
  orderNumber: string,
  ecomCode: string,
  invoiceId: string,
  contractMethod: ContractMethod,
  remark: string | null,
): Prisma.ManualRetryViewUpdateArgs {
  return {
    data: {
      retryButton: false,
      status: 'closed',
      remark: remark,
    },
    where: {
      orderNumber_invoiceNumber_ecomCode_contractMethod: {
        ecomCode: ecomCode,
        invoiceNumber: invoiceId,
        orderNumber: orderNumber,
        contractMethod: contractMethod,
      },
    },
  };
}

export function deleteManualRetryView(
  orderNumber: string,
  ecomCode: string,
  invoiceId: string,
  contractMethod: ContractMethod,
): Prisma.ManualRetryViewDeleteArgs {
  return {
    where: {
      orderNumber_invoiceNumber_ecomCode_contractMethod: {
        ecomCode: ecomCode,
        invoiceNumber: invoiceId,
        orderNumber: orderNumber,
        contractMethod: contractMethod,
      },
    },
  };
}
