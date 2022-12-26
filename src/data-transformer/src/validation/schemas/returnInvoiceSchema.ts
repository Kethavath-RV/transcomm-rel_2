import { JSONSchemaType } from 'ajv';
import { ReturnInvoice } from 'core';
import modeTypeEnumSchema from './enums/modeTypeEnumSchema';
import returnLineItemSchema from './returnLineItemSchema';

const returnInvoiceSchema: JSONSchemaType<ReturnInvoice> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  required: [],
  definitions: {
    ModeType: modeTypeEnumSchema,
  },
  properties: {
    invoiceNumber: {
      type: 'string',
      maxLength: 20,
    },
    exporterCode: {
      type: 'string',
      maxLength: 20,
    },
    mode: {
      $ref: '#/definitions/ModeType',
    },
    returnDetail: {
      properties: {
        returnRequestNo: {
          type: 'string',
          maxLength: 255,
          nullable: true,
        },
        prevTransportDocNo: {
          type: 'string',
          maxLength: 30,
          nullable: true,
        },
        returnTransportDocNo: {
          type: 'string',
          maxLength: 30,
          nullable: true,
        },
        returnReason: {
          type: 'string',
          nullable: true,
        },
        declarationPurposeDetails: {
          type: 'string',
          maxLength: 1000,
          nullable: true,
        },
        returnJustification: {
          type: 'string',
          maxLength: 1000,
          nullable: true,
        },
      },
      required: ['returnRequestNo'],
      type: 'object',
      nullable: true,
    },
    lineItems: {
      items: returnLineItemSchema,
      type: 'array',
      uniqueItemProperties: ['lineNo'],
    },
  },
  type: 'object',
  additionalProperties: false,
};

export default returnInvoiceSchema;
