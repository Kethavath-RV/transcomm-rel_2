import { JSONSchemaType } from 'ajv';
import { PaymentInstrumentType } from 'core';

const paymentInstrumentTypeEnumSchema: JSONSchemaType<PaymentInstrumentType> = {
  enum: [1, 10, 2, 3, 4, 5, 6, 7, 8, 9],
  type: 'number',
};

export default paymentInstrumentTypeEnumSchema;
