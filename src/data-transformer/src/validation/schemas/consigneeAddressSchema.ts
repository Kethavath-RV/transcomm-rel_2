import { JSONSchemaType } from 'ajv';
import { ConsigneeAddress } from 'core';

const consigneeAddressSchema: JSONSchemaType<ConsigneeAddress> = {
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
    country: {
      $ref: '#/definitions/Country',
    },
    email: {
      type: 'string',
      maxLength: 255,
    },
    phone: {
      type: 'string',
      maxLength: 15,
    },
  },
  nullable: true,
  required: [],
  type: 'object',
};

export default consigneeAddressSchema;
