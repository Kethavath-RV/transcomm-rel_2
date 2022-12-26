import { JSONSchemaType } from 'ajv';
import { ConfirmReturnLineItem } from 'core';

const confirmReturnDeliveryLineItemSchema: JSONSchemaType<ConfirmReturnLineItem> =
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    properties: {
      lineNo: {
        type: 'number',
        maximum: 9999,
      },
      hscode: {
        type: 'string',
        maxLength: 12,
      },
      skuProductCode: {
        type: 'string',
        maxLength: 255,
        nullable: true,
      },
      receviedQuantity: {
        type: 'number',
      },
      isExtra: {
        type: 'string',
        maxLength: 1,
      },
      quantityUOM: {
        type: 'string',
        maxLength: 255,
      },
      goodsCondition: {
        type: 'string',
        maxLength: 1,
        nullable: true
      },
    },
    required: [
      'lineNo',
      'hscode',
      'receviedQuantity',
      'isExtra',
      'quantityUOM',
    ],
    additionalProperties: false,
    type: 'object',
  };

export default confirmReturnDeliveryLineItemSchema;
