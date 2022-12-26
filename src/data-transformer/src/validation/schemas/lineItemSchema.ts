import { JSONSchemaType } from 'ajv';
import { SubmitOrderLineItem, YesNo } from 'core';
import discountSchema from './discountSchema';
import documentSchema from './documentSchema';
import dutiesSchema from './dutiesSchema';
import countryEnumSchema from './enums/countryEnumSchema';
import goodsConditionEnumSchema from './enums/goodsConditionEnumSchema';
import modeTypeEnumSchema from './enums/modeTypeEnumSchema';
import exemptionSchema from './exemptionSchema';
import permitSchema from './permitSchema';
import skuSchema from './skuSchema';
import vehicleSchema from './vehicleSchema';

const lineItemSchema: JSONSchemaType<SubmitOrderLineItem> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    countryOfOrigin: countryEnumSchema,
    lineNo: {
      type: 'number',
      maximum: 9999,
    },
    hscode: {
      type: 'string',
      maxLength: 12,
      nullable: true,
    },
    prevDeclarationReference: {
      type: 'string',
      maxLength: 15,
      nullable: true,
    },
    permits: {
      items: permitSchema,
      type: 'array',
      nullable: true,
    },
    sku: skuSchema,
    exemptions: {
      items: exemptionSchema,
      type: 'array',
      maxItems: 1,
      nullable: true,
    },
    vehicle: vehicleSchema,
    description: {
      type: 'string',
      nullable: true,
      maxLength: 255
    },
    discount: discountSchema,
    documents: {
      items: documentSchema,
      type: 'array',
      maxItems: 3,
      nullable: true,
    },
    goodsCondition: goodsConditionEnumSchema,
    isFreeOfCost: {
      enum: [YesNo.No, YesNo.Yes],
      type: 'string',
    },
    mode: modeTypeEnumSchema,
    netWeight: {
      type: 'number',
      nullable: true,
    },
    netWeightUOM: {
      $ref: '#/definitions/UnitOfMeasurement',
    },
    originalValueOfItem: {
      type: 'number',
      nullable: true,
    },
    quantity: {
      type: 'number',
      nullable: true,
    },
    quantityReturned: {
      type: 'number',
      nullable: true,
    },
    quantityUOM: {
      $ref: '#/definitions/UnitOfMeasurement',
    },
    supplementaryQuantity: {
      type: 'number',
      nullable: true,
    },
    supplementaryQuantityUOM: {
      $ref: '#/definitions/UnitOfMeasurement',
      nullable: true,
      type: 'string',
    },
    valueOfGoods: {
      type: 'number',
      nullable: true,
    },
  },
  required: [],
  type: 'object',
  anyOf: [
    {
      required: ['quantity'],
    },
    {
      required: ['supplementaryQuantity'],
    },
  ],
};

export default lineItemSchema;
