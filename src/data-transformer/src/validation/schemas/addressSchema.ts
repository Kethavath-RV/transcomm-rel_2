import { JSONSchemaType } from 'ajv';
import { Address } from 'core';
import countryEnumSchema from './enums/countryEnumSchema';

const addressSchema: JSONSchemaType<Address> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    POBox: {
      type: 'string',
      maxLength: 255,
    },
    addressLine1: {
      type: 'string',
      maxLength: 255,
    },
    addressLine2: {
      type: 'string',
      maxLength: 255,
    },
    city: {
      type: 'string',
      maxLength: 5,
    },
    country: countryEnumSchema,
  },
  required: [],
  type: 'object',
  additionalProperties: false
};

export default addressSchema;
