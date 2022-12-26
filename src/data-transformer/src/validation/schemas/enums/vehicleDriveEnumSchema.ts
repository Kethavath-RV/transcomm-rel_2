import { JSONSchemaType } from 'ajv';
import { VehicleDrive } from 'core';

const vehicleDriveEnumSchema: JSONSchemaType<VehicleDrive> = {
  enum: ['L', 'N', 'R'],
  type: 'string',
};

export default vehicleDriveEnumSchema;
