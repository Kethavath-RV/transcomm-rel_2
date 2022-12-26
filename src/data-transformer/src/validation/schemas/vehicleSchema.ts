import { JSONSchemaType } from 'ajv';
import { SubmitOrderVehicle } from 'core';
import vehicleBrandEnumSchema from './enums/vehicleBrandEnumSchema';
import vehicleConditionEnumSchema from './enums/vehicleConditionEnumSchema';
import vehicleDriveEnumSchema from './enums/vehicleDriveEnumSchema';
import vehicleTypeEnumSchema from './enums/vehicleTypeEnumSchema';

const vehicleSchema: JSONSchemaType<SubmitOrderVehicle> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    VehicleBrand: vehicleBrandEnumSchema,
    VehicleCondition: vehicleConditionEnumSchema,
    VehicleDrive: vehicleDriveEnumSchema,
    VehicleType: vehicleTypeEnumSchema,
  },
  properties: {
    brand: {
      $ref: '#/definitions/VehicleBrand',
    },
    capacity: {
      type: 'number',
      nullable: true,
    },
    carriageCapacity: {
      type: 'number',
      nullable: true,
    },
    chassisNumber: {
      type: 'string',
      maxLength: 24,
      nullable: true,
    },
    color: {
      type: 'string',
      maxLength: 30,
      nullable: true,
    },
    condition: {
      $ref: '#/definitions/VehicleCondition',
    },
    drive: {
      $ref: '#/definitions/VehicleDrive',
    },
    engineNumber: {
      type: 'string',
      maxLength: 30,
      nullable: true,
    },
    model: {
      type: 'string',
      maxLength: 60,
      nullable: true,
    },
    passengerCapacity: {
      type: 'number',
      nullable: true,
    },
    specificationStandard: {
      type: 'string',
      maxLength: 100,
      nullable: true,
    },
    vehicleType: {
      $ref: '#/definitions/VehicleType',
    },
    yearOfBuilt: {
      type: 'string',
      maxLength: 4,
      nullable: true,
    },
  },
  required: [],
  type: 'object',
};

export default vehicleSchema;
