import { JSONSchemaType } from 'ajv';
import { Duty } from 'core';

const dutiesSchema: JSONSchemaType<Duty> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    dutyType: {
      type: 'string',
      maxLength: 255,
      nullable: true,
    },
    dutyValue: {
      type: 'number',
      nullable: true,
    },
  },
  required: [],
  type: 'object',
};

export default dutiesSchema;
