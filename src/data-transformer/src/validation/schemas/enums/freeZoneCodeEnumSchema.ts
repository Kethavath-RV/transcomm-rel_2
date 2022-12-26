import { JSONSchemaType } from 'ajv';
import { FreeZoneCode } from 'core';

const freeZoneCodeEnumSchema: JSONSchemaType<FreeZoneCode> = {
  enum: [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '15',
    '16',
    '17',
    '18',
  ],
  type: 'string',
};

export default freeZoneCodeEnumSchema;
