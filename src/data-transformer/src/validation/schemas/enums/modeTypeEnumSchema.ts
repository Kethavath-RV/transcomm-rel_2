import { JSONSchemaType } from 'ajv';
import { ModeType } from 'core';

const modeTypeEnumSchema: JSONSchemaType<ModeType> = {
  enum: ['B', 'C', 'F', 'R', 'U'],
  type: 'string',
};

export default modeTypeEnumSchema;
