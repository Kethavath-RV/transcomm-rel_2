import { JSONSchemaType } from 'ajv';
import { SubmitOrderPermit, YesNo } from 'core';
import permitIssuingAuthorityCodeEnumSchema from './enums/permitIssuingAuthorityCodeEnumSchema';

const permitSchema: JSONSchemaType<SubmitOrderPermit> = {
  properties: {
    referenceNo: {
      type: 'string',
      maxLength: 30,
      nullable: true,
    },
    notRequiredFlag: {
      enum: [YesNo.No, YesNo.Yes],
      type: 'string',
      nullable: true,
    },
    issuingAuthorityCode: permitIssuingAuthorityCodeEnumSchema,
  },
  required: [],
  type: 'object',
  if: {
    properties: {
      notRequiredFlag: { type: 'string', enum: [YesNo.Yes], nullable: true },
    },
  },
  then: { required: ['referenceNo'] },
};

export default permitSchema;
