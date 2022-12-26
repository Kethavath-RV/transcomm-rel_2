import { JSONSchemaType } from 'ajv';
import { Kvp } from 'core';

const kvpSchema: JSONSchemaType<Kvp> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    attributeSerialNo: {
      type: 'number',
    },
    attributeName: {
      type: 'string',
      maxLength: 255,
    },
    attributeValue: {
      type: 'string',
      maxLength: 255,
    },
  },
  required: [],
  type: 'object',
};

export default kvpSchema;
