import { JSONSchemaType } from 'ajv';
import { VehicleCondition } from 'core';

const vehicleConditionEnumSchema: JSONSchemaType<VehicleCondition> = {
  enum: ['N', 'O'],
  type: 'string',
};

export default vehicleConditionEnumSchema;
