import { JSONSchemaType } from 'ajv';
import { ReturnLineItem } from 'core';
import modeTypeEnumSchema from './enums/modeTypeEnumSchema';
import exemptionSchema from './exemptionSchema';

const returnLineItemSchema: JSONSchemaType<ReturnLineItem> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    lineNo: {
      type: 'number',
      maximum: 9999,
    },
    mode: modeTypeEnumSchema,
    quantityReturned: {
      type: 'number',
      nullable: true,
    },
    hscode: {
      type: 'string',
      maxLength: 12,
      nullable: true,
    },
    exemptions: {
      items: exemptionSchema,
      type: 'array',
      maxItems: 1,
      nullable: true,
    },
  },
  required: [],
  type: 'object',
};

export default returnLineItemSchema;
