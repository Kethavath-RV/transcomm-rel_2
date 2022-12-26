import { JSONSchemaType } from 'ajv';
import { Exemption } from 'core';
import exemptionTypeSchema from './enums/exemptionTypeEnumSchema';

const exemptionSchema: JSONSchemaType<Exemption> = {
  properties: {
    exemptionType: exemptionTypeSchema,
    exemptionRefNo: {
      type: 'string',
      maxLength: 30,
      nullable: true,
    },
  },
  required: [],
  type: 'object',
};

export default exemptionSchema;
