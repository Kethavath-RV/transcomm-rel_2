import { CancelOrder } from 'core';
import { JSONSchemaType } from 'ajv';
import cancelInvoiceSchema from './cancelInvoiceSchema';
import modeTypeEnumSchema from './enums/modeTypeEnumSchema';

const cancelOrderSchema: JSONSchemaType<CancelOrder> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    ModeType: modeTypeEnumSchema,
  },
  properties: {
    orderNumber: {
      type: 'string',
      maxLength: 255,
    },
    actionDate: {
      type: 'string',
      format: 'date-time',
      errorMessage: "Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ e.g. 2021-10-15T11:09:06Z)"
    },
    ecomBusinessCode: {
      type: 'string',
      maxLength: 255,
      nullable: true,
    },
    mode: {
      $ref: '#/definitions/ModeType',
    },
    invoices: {
      items: cancelInvoiceSchema,
      type: 'array',
      uniqueItemProperties: ['exporterCode', 'invoiceNumber'],
    },
  },
  required: ['orderNumber', 'ecomBusinessCode', 'actionDate', 'mode'],
  type: 'object',
  additionalProperties: false,
};

export default cancelOrderSchema;
