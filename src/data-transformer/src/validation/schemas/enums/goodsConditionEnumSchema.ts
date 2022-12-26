import { JSONSchemaType } from 'ajv';
import { GoodsCondition } from 'core';

const goodsConditionEnumSchema: JSONSchemaType<GoodsCondition> = {
  enum: ['N', 'U'],
  type: 'string',
};

export default goodsConditionEnumSchema;
