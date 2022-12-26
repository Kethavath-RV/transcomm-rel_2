import { JSONSchemaType } from 'ajv';
import { SubmitOrderInvoice } from 'core';
import documentSchema from './documentSchema';
import cargoOwnershipEnumSchema from './enums/cargoOwnershipEnumSchema';
import currencyEnumSchema from './enums/currencyEnumSchema';
import exemptionTypeEnumSchema from './enums/exemptionTypeEnumSchema';
import freeZoneCodeEnumSchema from './enums/freeZoneCodeEnumSchema';
import goodsConditionEnumSchema from './enums/goodsConditionEnumSchema';
import incoTermCodeEnumSchema from './enums/incoTermCodeEnumSchema';
import invoiceTypeEnumSchema from './enums/invoiceTypeEnumSchema';
import modeTypeEnumSchema from './enums/modeTypeEnumSchema';
import paymentInstrumentTypeEnumSchema from './enums/paymentInstrumentTypeEnumSchema';
import unitOfMeasurementEnumSchema from './enums/unitOfMeasurementEnumSchema';
import vehicleBrandEnumSchema from './enums/vehicleBrandEnumSchema';
import vehicleConditionEnumSchema from './enums/vehicleConditionEnumSchema';
import vehicleDriveEnumSchema from './enums/vehicleDriveEnumSchema';
import vehicleTypeEnumSchema from './enums/vehicleTypeEnumSchema';
import lineItemSchema from './lineItemSchema';

const invoiceSchema: JSONSchemaType<SubmitOrderInvoice> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  required: [],
  definitions: {
    Currencies: currencyEnumSchema,
    ExemptionType: exemptionTypeEnumSchema,
    FreeZoneCode: freeZoneCodeEnumSchema,
    GoodsCondition: goodsConditionEnumSchema,
    IncoTermCode: incoTermCodeEnumSchema,
    InvoiceType: invoiceTypeEnumSchema,
    ModeType: modeTypeEnumSchema,
    PaymentInstrumentType: paymentInstrumentTypeEnumSchema,
    UnitOfMeasurement: unitOfMeasurementEnumSchema,
    VehicleBrand: vehicleBrandEnumSchema,
    VehicleCondition: vehicleConditionEnumSchema,
    VehicleDrive: vehicleDriveEnumSchema,
    FreightCurrencies: currencyEnumSchema,
    InsuranceCurrencies: currencyEnumSchema,
    VehicleType: vehicleTypeEnumSchema,
    CargoOwnership: cargoOwnershipEnumSchema,
  },
  properties: {
    associatedEcomCompany: {
      type: 'string',
      nullable: true,
      maxLength: 15,
    },
    deliveryProviderBusinessCode: {
      type: 'string',
      nullable: true,
      maxLength: 10,
    },
    otherShipToAddress: {
      $ref: '#/definitions/Address',
    },
    brokerBusinessCode: {
      type: 'string',
      nullable: true,
    },
    cancellationReason: {
      type: 'string',
      maxLength: 2000,
      nullable: true,
    },
    cargoOwnership: {
      $ref: '#/definitions/CargoOwnership',
    },
    currency: {
      $ref: '#/definitions/Currencies',
    },
    documents: {
      items: documentSchema,
      type: 'array',
      maxItems: 3,
      nullable: true,
    },
    exporterCode: {
      type: 'string',
      maxLength: 30,
      nullable: true,
    },
    freightAmount: {
      type: 'number',
      nullable: true,
    },
    freightCurrency: {
      $ref: '#/definitions/Currencies',
      type: 'string',
      nullable: true,
    },
    FZCode: {
      $ref: '#/definitions/FreeZoneCode',
    },
    incoTerm: {
      $ref: '#/definitions/IncoTermCode',
    },
    insuranceAmount: {
      nullable: true,
      type: 'number',
    },
    insuranceCurrency: {
      $ref: '#/definitions/Currencies',
      type: 'string',
      nullable: true,
    },
    invoiceDate: {
      type: 'string',
      nullable: true,
      format: 'date-time',
      errorMessage:
        'Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ e.g. 2021-10-15T11:09:06Z)',
    },
    invoiceNumber: {
      type: 'string',
      maxLength: 20,
    },
    invoiceType: {
      $ref: '#/definitions/InvoiceType',
      type: 'number',
      nullable: true,
    },
    lineItems: {
      items: lineItemSchema,
      type: 'array',
      uniqueItemProperties: ['lineNo'],
    },
    logisticsSPBusinessCode: {
      type: 'string',
      nullable: true,
    },
    mode: modeTypeEnumSchema,
    paymentInstrumentType: {
      $ref: '#/definitions/PaymentInstrumentType',
    },
    returnDetail: {
      properties: {
        returnRequestNo: {
          type: 'string',
          maxLength: 255,
          nullable: true,
        },
        prevTransportDocNo: {
          type: 'string',
          maxLength: 30,
          nullable: true,
        },
        returnReason: {
          type: 'string',
          nullable: true,
        },
        declarationPurposeDetails: {
          type: 'string',
          maxLength: 1000,
          nullable: true,
        },
        returnJustification: {
          type: 'string',
          maxLength: 1000,
          nullable: true,
        },
      },
      required: [],
      type: 'object',
      nullable: true,
    },
    totalNoOfInvoicePages: {
      type: 'number',
      nullable: true,
    },
    warehouseCode: {
      type: 'string',
      maxLength: 15,
      nullable: true,
    },
  },
  type: 'object',
};

export default invoiceSchema;
