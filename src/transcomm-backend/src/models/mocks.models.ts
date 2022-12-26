import {
  Country,
  Currencies,
  DetailMovement,
  ExemptionType,
  FreeZoneCode,
  GoodsCondition,
  IncoTermCode,
  SubmitOrderInvoice,
  InvoiceType,
  MasterMovement,
  ModeType,
  NotificationType,
  SubmitOrder,
  PaymentInstrumentType,
  PermitIssuingAuthorityCode,
  ReturnReason,
  UnitOfMeasurement,
  VehicleBrand,
  VehicleCondition,
  VehicleDrive,
  VehicleType,
  YesNo,
  CheckPointFile,
  CancelOrder,
  CargoOwnership,
  ReturnDetail,
} from 'core';

const orderId = 'testOrderNumber';
const invoiceId = 'testInvoiceId';
const mawbNumber = 'testMawbNumber';
const airwayBillNo = 'testAirwayBillNo';
const ecomCode = 'testEcom';

export const mockSubmitOrder: SubmitOrder = {
  orderNumber: orderId,
  orderDate: '2021-08-13T09:26:55+0000',
  actionDate: '2021-08-13T09:26:55+0000',
  ecomBusinessCode: 'testEcomBusinessCode',
  mode: ModeType.Final,
  consigneeAddress: {
    phone: 'testPhone',
    email: 'testEmail',
    addressLine1: 'testAddressLine1',
    addressLine2: 'testAddressLine2',
    POBox: 'testPOBox',
    city: 'testCity',
    country: Country.Djibouti,
  },
  billTo: 'testConsigneeCode',
  billToAddress: {
    addressLine1: 'testAddressLine1',
    addressLine2: 'testAddressLine2',
    POBox: 'testPOBox',
    city: 'testCity',
    country: Country.Djibouti,
  },
  documents: [
    {
      hash: 'testHash',
      path: 'testPath',
      name: 'testName',
    },
  ],
  invoices: [
    {
      freightCurrency: Currencies.ArubanGuilder,
      insuranceCurrency: Currencies.ArubanGuilder,
      invoiceNumber: 'testInvoiceNumber',
      invoiceDate: '2021-08-13T09:26:55+0000',
      mode: ModeType.Final,
      cancellationReason: 'testCancellationReason',
      totalNoOfInvoicePages: 0,
      invoiceType: InvoiceType.CommercialInvoice,
      paymentInstrumentType: PaymentInstrumentType.Cash,
      currency: Currencies.ArubanGuilder,
      incoTerm: IncoTermCode.CarriageInsurancePaidTo,
      exporterCode: 'testExporterCode',
      FZCode: FreeZoneCode.AirportFreeZone,
      warehouseCode: 'testWarehouseCode',
      cargoOwnership: CargoOwnership.SelfOwnership,
      associatedEcomCompany: 'associatedEcomCompany',
      brokerBusinessCode: 'testBrokerBusinessCode',
      logisticsSPBusinessCode: 'testLogisticsSPBusinessCode',
      documents: [
        {
          hash: 'testHash',
          path: 'testPath',
          name: 'testName',
        },
      ],
      returnDetail: {
        returnRequestNo: 'testReturnRequestNo',
        prevTransportDocNo: 'testPrevTransportDocNo',
        returnReason: ReturnReason.Undelivered,
        declarationPurposeDetails: 'testDeclarationPurposeDetails',
      },
      lineItems: [
        {
          quantityReturned: 0,
          lineNo: 0,
          mode: ModeType.Final,
          quantity: 0,
          quantityUOM: UnitOfMeasurement.Carat,
          netWeight: 0,
          netWeightUOM: UnitOfMeasurement.CubicMeters,
          description: 'testDescription',
          hscode: 'testHsCode',
          countryOfOrigin: Country.YemenYemenArabRepublic,
          discount: {},
          valueOfGoods: 0,
          originalValueOfItem: 0,
          isFreeOfCost: YesNo.No,
          // duties: [],
          // dutyPaid: YesNo.No,
          supplementaryQuantityUOM: UnitOfMeasurement.CubicMeters,
          goodsCondition: GoodsCondition.New,
          prevDeclarationReference: 'testPrevDeclarationReference',
          permits: [
            {
              referenceNo: 'testReferenceNo',
              issuingAuthorityCode: PermitIssuingAuthorityCode.CentralBank,
              notRequiredFlag: YesNo.No,
            },
          ],
          sku: {
            productCode: 'testProductCode',
            quantityUOM: 'testQuantityUom',
          },
          exemptions: [
            {
              exemptionType: ExemptionType.AccrediatedClient,
              exemptionRefNo: 'testExemptionRefNo',
            },
          ],
          documents: [
            {
              hash: 'testHash',
              path: 'testPath',
              name: 'testName',
            },
          ],
          vehicle: {
            chassisNumber: 'testChassisNumber',
            brand: VehicleBrand.Acura,
            model: 'testModel',
            engineNumber: 'testEngineNumber',
            capacity: 0,
            passengerCapacity: 0,
            carriageCapacity: 0,
            yearOfBuilt: 'testYearOfBuilt',
            color: 'testColor',
            condition: VehicleCondition.New,
            vehicleType: VehicleType.AllTerrain,
            drive: VehicleDrive.LeftHand,
            specificationStandard: 'testSpecificationStandard',
          },
        },
      ],
    },
  ],
};

export const mockPickupFile: CheckPointFile = {
  eventCode: 'PU',
  eventRemark: '',
  weight: 0,
  volumeWeight: 0,
  weightQualifier: '',
  shipperReference: orderId,
  hawb: '',
  ETADateTime: '',
  eventDate: '',
  eventGMT: '',
  destination: '',
  origin: '',
  numberOfPackages: 0,
  shipmentCurrency: '',
  shipmentDeclaredValue: '',
  ecomBusinessCode: ecomCode,
};

export const mockInvoice: SubmitOrderInvoice = {
  invoiceNumber: invoiceId,
  invoiceDate: '',
  mode: ModeType.Final,
  cancellationReason: '',
  totalNoOfInvoicePages: 0,
  invoiceType: InvoiceType.Invoice,
  paymentInstrumentType: PaymentInstrumentType.BankTransfer,
  currency: Currencies.Afghani,
  incoTerm: IncoTermCode.CarriageInsurancePaidTo,
  exporterCode: '',
  FZCode: FreeZoneCode.AirportFreeZone,
  warehouseCode: '',
  cargoOwnership: CargoOwnership.SelfOwnership,
  associatedEcomCompany: '',
  brokerBusinessCode: '',
  logisticsSPBusinessCode: '',
  documents: [],
  returnDetail: {} as ReturnDetail,
  freightCurrency: Currencies.Albanian,
  insuranceCurrency: Currencies.Albanian,
  lineItems: [],
};

export const mockMasterMovement: MasterMovement = {
  movementDepartureDate: '',
  movementDepartureTime: '',
  movementGMT: '',
  mawbNumber: mawbNumber,
  weightUnit: UnitOfMeasurement.Kilogram,
  handlingUnits: {
    handlingUnitNumber: '',
    handlingUnitParent: '',
    handlingUnitRegNumber: '',
    handlingUnitType: '',
  },
  movementNumber: '',
  movementOrigin: '',
  movementOriginCountry: '',
  movementDestination: '',
};

export const detailMovement: DetailMovement = {
  airwayBillNumber: airwayBillNo,
  handlingUnitNumber: '',
  incoterm: '',
  consigneeCountryCode: '',
  item: { unitOfMeasure: '' },
  mawbNumber: mawbNumber,
  shipmentActualWeight: 0,
  shipmentDeclaredVolumeWeight: 0,
  shipmentDestination: '',
  shipmentOrigin: '',
  shipmentOriginCountry: '',
  shipmentTotalVolumeMetricWeight: 0,
  shipmentWeight: 0,
  shipperRef: [],
  totalPiecesInShipment: 0,
};

export const mockMasterMovementFromKafka = {
  payload: {
    items: [
      {
        MovementDepartureDate: '2021/05/03',
        MovementDepartureTime: '06:16:14',
        WeightUnit: 'kg',
        MawbNumber: '15509111675',
        HandlingUnit: [
          {
            HandlingUnitNumber: 'H964928145',
            HandlingUnitType: '',
            HandlingUnitRegNumber: 'AAX4903DHL',
            HandlingUnitParent: 'H643447895',
            Hawb: [
              {
                AirwayBillNumber: '2511188466',
              },
            ],
          },
          {
            HandlingUnitNumber: 'H964928226',
            HandlingUnitType: '',
            HandlingUnitRegNumber: 'AAX5630DHL',
            HandlingUnitParent: 'H643447711',
            Hawb: {
              AirwayBillNumber: '2511188466',
            },
          },
        ],
      },
    ],
  },
};

export const mockDetailMovementFromKafka = [
  {
    AirwayBillNumber: '2511188466',
    ShipmentOrigin: 'DXB',
    ShipmentOriginCountry: 'AE',
    ShipmentDestination: 'ZYP',
    ShipmentWeight: '0.5',
    ShipmentActualWeight: '0.1',
    ShipmentDeclaredVolumeWeight: '0.36',
    ShipmentTotalVolumeMetricWeight: '0.0',
    Incoterm: 'DAP',
    TotalPiecesInShipment: '1',
    Item: {
      UnitOfMeasure: 'BOX',
    },
    ShipperRef: [
      {
        ShipmentRef: '1405050032',
        Qualifier: 'UCI',
      },
      {
        ShipmentRef: '1405050032AE20210502075244076',
        Qualifier: 'UCB',
      },
    ],
    MawbNumber: '15509111675',
    HandlingUnitNumber: 'H964928145',
  },
];

export const mockNotification = {
  id: 'vc-id-1',
  type: NotificationType.processed,
  content: '',
};

export const cancelOrder: CancelOrder = {
  actionDate: '14/01/2020 10:10:00',
  mode: ModeType.Cancel,
  orderNumber: 'cancel-order-1',
  ecomBusinessCode: 'test',
  invoices: [
    {
      invoiceNumber: 'testInvoiceNumber',
      cancellationReason: 'some reason',
    },
  ],
};
