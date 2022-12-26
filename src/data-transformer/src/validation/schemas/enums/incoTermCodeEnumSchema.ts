import { JSONSchemaType } from 'ajv';
import { IncoTermCode } from 'core';

const incoTermCodeEnumSchema: JSONSchemaType<IncoTermCode> = {
  enum: [
    'CFR',
    'CIF',
    'CIP',
    'CPT',
    'DAF',
    'DAP',
    'DAT',
    'DDP',
    'DDU',
    'DEQ',
    'DES',
    'EXW',
    'FAS',
    'FCA',
    'FOB',
  ],
  type: 'string',
};

export default incoTermCodeEnumSchema;
