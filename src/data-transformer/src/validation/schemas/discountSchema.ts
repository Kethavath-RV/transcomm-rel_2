import { JSONSchemaType } from 'ajv';
import { SubmitOrderDiscount } from 'core';

const discountSchema: JSONSchemaType<SubmitOrderDiscount> = {
  properties: {
    percentage: {
      type: 'number',
      nullable: true
    },
    value: {
      type: 'number',
      nullable: true
    },
  },
  required: [],
  type: 'object',
  oneOf: [
    {
      required: ['percentage'],
    },
    {
      required: ['value'],
    },
  ],
};

export default discountSchema;
