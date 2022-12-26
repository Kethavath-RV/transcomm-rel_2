import { JSONSchemaType } from 'ajv';
import { ExemptionType } from 'core';

const exemptionTypeEnumSchema: JSONSchemaType<ExemptionType> = {
  type: 'number',
  enum: [
    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1012, 1013,
    1014, 1015, 1016, 1017, 1018, 1019, 1020, 1022, 1023, 1024, 1025, 1026,
    1027, 1029, 1030, 1031, 1032, 1034,
  ],
};

export default exemptionTypeEnumSchema;
