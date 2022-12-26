import { JSONSchemaType } from 'ajv';
import { SubmitOrder } from 'core';
import addressSchema from './addressSchema';
import consigneeAddressSchema from './consigneeAddressSchema';
import documentSchema from './documentSchema';
import cargoOwnershipEnumSchema from './enums/cargoOwnershipEnumSchema';
import countryEnumSchema from './enums/countryEnumSchema';
import currencyEnumSchema from './enums/currencyEnumSchema';
import exemptionTypeEnumSchema from './enums/exemptionTypeEnumSchema';
import freeZoneCodeEnumSchema from './enums/freeZoneCodeEnumSchema';
import goodsConditionEnumSchema from './enums/goodsConditionEnumSchema';
import incoTermCodeEnumSchema from './enums/incoTermCodeEnumSchema';
import invoiceTypeEnumSchema from './enums/invoiceTypeEnumSchema';
import modeTypeEnumSchema from './enums/modeTypeEnumSchema';
import paymentInstrumentTypeEnumSchema from './enums/paymentInstrumentTypeEnumSchema';
import permitIssuingAuthorityCodeEnumSchema from './enums/permitIssuingAuthorityCodeEnumSchema';
import unitOfMeasurementEnumSchema from './enums/unitOfMeasurementEnumSchema';
import vehicleBrandEnumSchema from './enums/vehicleBrandEnumSchema';
import vehicleDriveEnumSchema from './enums/vehicleDriveEnumSchema';
import vehicleTypeEnumSchema from './enums/vehicleTypeEnumSchema';
import invoiceSchema from './invoiceSchema';
import kvpSchema from './kvpSchema';

const submitOrderSchema: JSONSchemaType<SubmitOrder> = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    Address: addressSchema,
    Country: countryEnumSchema,
    ConsigneeAddress: consigneeAddressSchema,
    Currencies: currencyEnumSchema,
    ExemptionType: exemptionTypeEnumSchema,
    FreeZoneCode: freeZoneCodeEnumSchema,
    GoodsCondition: goodsConditionEnumSchema,
    IncoTermCode: incoTermCodeEnumSchema,
    InvoiceType: invoiceTypeEnumSchema,
    ModeType: modeTypeEnumSchema,
    PaymentInstrumentType: paymentInstrumentTypeEnumSchema,
    PermitIssuingAuthorityCode: permitIssuingAuthorityCodeEnumSchema,
    UnitOfMeasurement: unitOfMeasurementEnumSchema,
    VehicleBrand: vehicleBrandEnumSchema,
    VehicleCondition: vehicleBrandEnumSchema,
    VehicleDrive: vehicleDriveEnumSchema,
    VehicleType: vehicleTypeEnumSchema,
    ShipToAddress: addressSchema,
    CargoOwnership: cargoOwnershipEnumSchema,
  },
  properties: {
    actionDate: {
      type: 'string',
      format: 'date-time',
      errorMessage: "Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ e.g. 2021-10-15T11:09:06Z)"
    },
    billTo: {
      type: 'string',
      maxLength: 255,
      nullable: true,
    },
    referenceId: {
      type: 'string',
      maxLength: 100,
      nullable: true,
    },
    eCommBusinessName: {
      type: 'string',
      maxLength: 100,
      nullable: true,
    },
    billToAddress: {
      $ref: '#/definitions/Address',
    },
    consigneeAddress: {
      $ref: '#/definitions/ConsigneeAddress',
    },
    consigneeName: {
      type: 'string',
      nullable: true,
      maxLength: 255,
    },
    documents: {
      items: documentSchema,
      type: 'array',
      maxItems: 3,
      nullable: true,
    },
    ecomBusinessCode: {
      type: 'string',
      maxLength: 15,
      nullable: true,
    },
    invoices: {
      items: invoiceSchema,
      type: 'array',
      uniqueItemProperties: ['exporterCode', 'invoiceNumber'],
    },
    mode: {
      $ref: '#/definitions/ModeType',
    },
    orderDate: {
      type: 'string',
      format: 'date-time',
      errorMessage: "Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ e.g. 2021-10-15T11:09:06Z)"
    },
    orderNumber: {
      type: 'string',
      maxLength: 255,
    },
    shipTo: {
      type: 'string',
      nullable: true,
      maxLength: 50
    },
    shipToAddress: {
      $ref: '#/definitions/ShipToAddress',
    },
    __kvp: {
      items: kvpSchema,
      type: 'array',
      nullable: true,
    },
  },
  required: ['orderNumber', 'ecomBusinessCode', 'actionDate', 'mode', 'orderDate'],
  type: 'object',
  if: {
    not: { required: ['eCommBusinessName'] },
  },
  then: {
    required: ['consigneeName', 'consigneeAddress'],
    properties: {
      consigneeAddress: {
        required: ['addressLine1', 'city', 'country', 'phone', 'email'],
        type: 'object',
        nullable: true,
      },
    },
  },
  additionalProperties: false,
};

export default submitOrderSchema;
