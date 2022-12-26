import Ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import addFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';

import {
  CancelOrder,
  ConfirmReturnDelivery,
  hsCodes,
  ModeType,
  Order,
  ReturnOrder,
} from 'core';
import cancelOrderSchema from './schemas/cancelOrderSchema';
import confirmReturnDeliverySchema from './schemas/confirmReturnDeliverySchema';
import submitOrderSchema from './schemas/submitOrderSchema';
import returnOrderSchema from './schemas/returnOrderSchema';

const ajv = addFormats(ajvErrors(ajvKeywords(new Ajv({ allErrors: true }))));

const validateSchemaSubmitOrder = ajv.compile<Order>(submitOrderSchema);
const validateSchemaReturnOrder = ajv.compile<ReturnOrder>(returnOrderSchema);
const validateSchemaCancelOrder = ajv.compile<CancelOrder>(cancelOrderSchema);
const validateSchemaConfirmReturnDelivery = ajv.compile<ConfirmReturnDelivery>(
  confirmReturnDeliverySchema,
);

export function validateData(order: Order | ReturnOrder | CancelOrder): string {
  let cleanedOrder = removeEmpty(order);

  if (cleanedOrder.mode !== ModeType.Cancel) {
    try {
      cleanedOrder = validateHSCode(cleanedOrder);
    } catch (error) {
      return JSON.stringify('Invalid HSCode on Order');
    }
  }

  const checkAllSameMode = validateAllDataSameMode(cleanedOrder);
  if (checkAllSameMode !== 'OK') {
    return checkAllSameMode;
  }

  if (!cleanedOrder.orderNumber || cleanedOrder.orderNumber.length === 0) {
    return JSON.stringify('No ordernumber present on order');
  } else if (
    !cleanedOrder.ecomBusinessCode ||
    cleanedOrder.orderNumber.ecomBusinessCode === 0
  ) {
    return JSON.stringify('No ecomBusinessCode present on order');
  }
  // Could accessing a global constant to read the errors from last validation cause concurrency problems?
  else if (
    cleanedOrder.mode !== ModeType.Final &&
    cleanedOrder.mode !== ModeType.Return &&
    cleanedOrder.mode !== ModeType.Update &&
    cleanedOrder.mode !== ModeType.Cancel
  )
    return JSON.stringify('Not in mode Final, Return, Update or Cancel');
  else if (
    (cleanedOrder.mode === ModeType.Final || cleanedOrder.mode === ModeType.Update)&&
    !validateSchemaSubmitOrder(cleanedOrder)
  ) {
    return JSON.stringify(validateSchemaSubmitOrder.errors);
  } else if (
    cleanedOrder.mode === ModeType.Return &&
    !validateSchemaReturnOrder(cleanedOrder)
  ) {
    return JSON.stringify(validateSchemaReturnOrder.errors);
  } else if (
    cleanedOrder.mode === ModeType.Cancel &&
    !validateSchemaCancelOrder(cleanedOrder)
  ) {
    return JSON.stringify(validateSchemaCancelOrder.errors);
  } else return 'Success';
}

export function validateConfirmReturnDeliveryData(
  confirmReturnDelivery: ConfirmReturnDelivery,
): string {
  const cleanedOrder = removeEmpty(confirmReturnDelivery);
  if (!cleanedOrder.orderNumber || cleanedOrder.orderNumber.length === 0) {
    return JSON.stringify('No ordernumber present on order');
  } else if (!validateSchemaConfirmReturnDelivery(cleanedOrder)) {
    return JSON.stringify(validateSchemaConfirmReturnDelivery.errors);
  } else return 'Success';
}

export function validateAllDataSameMode(
  order: Order | ReturnOrder | CancelOrder,
): string {
  const modesFounds = recursiveSearch(order, 'mode');
  if (order.mode === ModeType.Basic) {
    if (modesFounds.length > 1 || modesFounds[0] !== 'B')
      return JSON.stringify(
        'If order is in mode `B`, invoice and lineItems must be in mode `B`',
      );
  } else if (order.mode === ModeType.Final) {
    if (modesFounds.length > 1 || modesFounds[0] !== 'F')
      return JSON.stringify(
        'If order is in mode `F`, invoice and lineItems must be in mode `F`',
      );
  } else if (order.mode === ModeType.Update) {
    if (
      modesFounds.length > 2 ||
      modesFounds.includes('B') ||
      modesFounds.includes('F') ||
      modesFounds.includes('R')
    )
      return JSON.stringify(
        'If order is in mode `U`, invoice and lineItems must be in mode `U` or `C`',
      );
  } else if (order.mode === ModeType.Return) {
    if (modesFounds.length > 1 || modesFounds[0] !== 'R')
      return JSON.stringify(
        'If order is in mode `R`, invoice and lineItems must be in mode `R`',
      );
  }
  return 'OK';
}

export const recursiveSearch = (
  obj: any,
  searchKey: string,
  results: string[] = [],
): string[] => {
  const r = results;
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (key === searchKey && typeof value !== 'object') {
      if (!r.includes(value)) r.push(value);
    } else if (typeof value === 'object') {
      recursiveSearch(value, searchKey, r);
    }
  });
  return r;
};

export function validateHSCode(
  order: Order | ReturnOrder,
): Order | ReturnOrder {
  order.invoices.forEach((inv) => {
    inv.lineItems.forEach((lineItem) => {
      if (lineItem.hscode) {
        try {
          lineItem.hscode = validateHSCodeString(lineItem.hscode);
        } catch (error) {
          throw new Error();
        }
      }
    });
  });

  return order;
}

export function validateHSCodeString(hsCode: string): string {
  let hsCodeNoDots = hsCode.split('.').join('');

  //For any invalid HS code, recursively remove last digit from order’s HS code, pad with “0” and recheck for validity in HS code table.
  //Process is to be done for 4 times.
  let counter = 1;
  while (counter < 5) {
    if (hsCodes.codes.includes(parseInt(hsCodeNoDots))) {
      return hsCodeNoDots;
    }
    hsCodeNoDots = hsCodeNoDots.slice(0, -counter).padEnd(7, '0');
    counter++;
  }
  throw new Error();
}

// Currently removes all values from the object that are either "" or null, so we can validate the object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeEmpty = (obj: any) => {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && typeof val === 'object' && removeEmpty(val)) ||
      ((val === null || val === '') && delete obj[key]),
  );
  return obj;
};
