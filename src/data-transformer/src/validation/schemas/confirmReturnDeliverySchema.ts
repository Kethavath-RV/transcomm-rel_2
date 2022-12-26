import { JSONSchemaType } from 'ajv';
import { ConfirmReturnDelivery } from 'core';
import confirmReturnDeliveryLineItemSchema from './confirmReturnDeliveryLineItemSchema';
import gatePassSchema from './gatePassSchema';
import kvpSchema from './kvpSchema';

const confirmReturnDeliverySchema: JSONSchemaType<ConfirmReturnDelivery> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    orderNumber: {
      type: 'string',
      maxLength: 20,
    },
    ecomBusinessCode: {
      type: 'string',
      maxLength: 15,
    },
    invoiceNumber: {
      type: 'string',
      maxLength: 20,
    },
    transportDocNo: {
      type: 'string',
      maxLength: 30,
      nullable: true,
    },
    transportProviderCode: {
      type: 'string',
      maxLength: 10,
      nullable: true,
    },
    returnRequestNo: {
      type: 'string',
      maxLength: 255,
    },
    dateOfReceivingBackGoods: {
      type: 'string',
      maxLength: 255,
    },
    lineItems: {
      items: confirmReturnDeliveryLineItemSchema,
      type: 'array',
      uniqueItemProperties: ['lineNo'],
    },
    gatePasses: {
      items: gatePassSchema,
      type: 'array',
      nullable: true,
    },
    kvp: {
      items: kvpSchema,
      type: 'array',
    },
  },
  required: [
    'orderNumber',
    'ecomBusinessCode',
    'invoiceNumber',
    'dateOfReceivingBackGoods',
    'lineItems',
  ],
  type: 'object',
  additionalProperties: false,
  anyOf: [
    {
      required: ['transportDocNo'],
    },
    {
      required: ['returnRequestNo'],
    },
  ],
};

export default confirmReturnDeliverySchema;
