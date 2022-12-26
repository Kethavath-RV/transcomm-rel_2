import { JSONSchemaType } from 'ajv';
import { Document } from 'core';

const documentSchema: JSONSchemaType<Document> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    hash: {
      type: 'string',
    },
    name: {
      type: 'string',
      maxLength: 255,
    },
    path: {
      type: 'string',
      maxLength: 255,
    },
  },
  required: [],
  type: 'object',
};

export default documentSchema;
