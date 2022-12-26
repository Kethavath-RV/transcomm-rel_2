import { JSONSchemaType } from 'ajv';
import { InvoiceType } from 'core';

const invoiceTypeEnumSchema: JSONSchemaType<InvoiceType> = {
  enum: [1, 2, 3, 4, 5, 6, 7, 8],
  type: 'number',
};

export default invoiceTypeEnumSchema;
