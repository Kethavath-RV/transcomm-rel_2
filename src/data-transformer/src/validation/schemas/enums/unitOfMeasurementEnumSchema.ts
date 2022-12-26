import { JSONSchemaType } from 'ajv';
import { UnitOfMeasurement } from 'core';

const unitOfMeasurementEnumSchema: JSONSchemaType<UnitOfMeasurement> = {
  enum: [
    '1000u',
    '12u',
    '2u',
    'carat',
    'kg',
    'kwh',
    'l',
    'm',
    'm2',
    'm3',
    'pack',
    'u',
  ],
  type: 'string',
};

export default unitOfMeasurementEnumSchema;
