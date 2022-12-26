import { JSONSchemaType } from 'ajv';
import { CargoOwnership } from 'core';

const cargoOwnershipEnumSchema: JSONSchemaType<CargoOwnership> = {
  enum: ['1', '2'],
  type: 'string',
};

export default cargoOwnershipEnumSchema;
