import { JSONSchemaType } from 'ajv';
import { SubmitOrderSku } from 'core';

const skuSchema: JSONSchemaType<SubmitOrderSku> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    productCode: {
      type: 'string',
      maxLength: 255,
      nullable: true,
    },
    quantityUOM: {
      type: 'string',
      maxLength: 255,
      nullable: true,
    },
    unitPrice: {
      type: 'number',
      nullable: true,
    },
  },
  required: [],
  type: 'object',
  nullable: true,
};

export default skuSchema;
