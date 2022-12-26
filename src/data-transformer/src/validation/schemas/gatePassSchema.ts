import { JSONSchemaType } from 'ajv';
import { GatePass } from 'core';

const gatePassSchema: JSONSchemaType<GatePass> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    gatePassNumber: {
      type: 'string',
      maxLength: 255,
    },
    gatePassDirection: {
      type: 'string',
      maxLength: 1,
    },
    ActualMovingInDate: {
      type: 'string',
      nullable: true,
    },
  },
  required: [],
  type: 'object',
};

export default gatePassSchema;
