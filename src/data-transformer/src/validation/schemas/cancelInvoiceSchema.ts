import { JSONSchemaType } from 'ajv';
import { CancelInvoice } from 'core';

const cancelInvoiceSchema: JSONSchemaType<CancelInvoice> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  required: ['invoiceNumber', 'cancellationReason'],
  properties: {
    invoiceNumber: {
      type: 'string',
      maxLength: 20,
    },
    cancellationReason: {
      type: 'string',
      maxLength: 2000,
    },
  },
  type: 'object',
};

export default cancelInvoiceSchema;
