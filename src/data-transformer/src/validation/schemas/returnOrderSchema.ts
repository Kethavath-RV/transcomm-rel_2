import { JSONSchemaType } from 'ajv';
import { ReturnOrder } from 'core';
import modeTypeEnumSchema from './enums/modeTypeEnumSchema';
import returnInvoiceSchema from './returnInvoiceSchema';

const returnOrderSchema: JSONSchemaType<ReturnOrder> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    ModeType: modeTypeEnumSchema,
  },
  properties: {
    orderNumber: {
      type: 'string',
      maxLength: 255,
    },
    ecomBusinessCode: {
      type: 'string',
      maxLength: 15,
      nullable: true,
    },
    actionDate: {
      type: 'string',
      format: 'date-time',
      errorMessage: "Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ e.g. 2021-10-15T11:09:06Z)",
    },
    mode: {
      $ref: '#/definitions/ModeType',
    },
    invoices: {
      items: returnInvoiceSchema,
      type: 'array',
      uniqueItemProperties: ['exporterCode', 'invoiceNumber'],
    },
  },
  required: ['orderNumber', 'ecomBusinessCode', 'actionDate', 'mode'],
  type: 'object',
  additionalProperties: false,
};

export default returnOrderSchema;
