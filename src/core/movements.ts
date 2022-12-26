import { UnitOfMeasurement } from './valueEnums';

export type MasterMovement = {
  mawbNumber: string;
  movementDepartureDate: string;
  movementDepartureTime: string;
  movementNumber: string;
  movementOrigin: string;
  movementOriginCountry: string;
  movementDestination: string;
  movementGMT: string;
  weightUnit: UnitOfMeasurement;
  volumeUnit?: UnitOfMeasurement;
  handlingUnits: {
    handlingUnitNumber: string;
    handlingUnitType: string;
    handlingUnitRegNumber: string;
    handlingUnitParent: string;
  };
};

export type DetailMovement = {
  airwayBillNumber: string;
  shipmentOrigin: string;
  shipmentOriginCountry: string;
  shipmentDestination: string;
  shipmentWeight: number;
  shipmentActualWeight: number;
  shipmentDeclaredVolumeWeight: number;
  shipmentTotalVolumeMetricWeight: number;
  consigneeCountryCode: string;
  incoterm: string;
  totalPiecesInShipment: number;
  item: {
    unitOfMeasure: string;
  };
  shipperRef: {
    shipmentRef: string;
    qualifier: string;
  }[];
  mawbNumber: string;
  handlingUnitNumber: string;
};

export interface Movement {
  type: string;
  mawb: string;
  hawb: string;
  airwayBillNumber: string;
  flightNumber: string;
  shippingParameterId: string;
  referenceID: string;
  mode: string;
  broker: string;
  agent: string;
  cargoHandler: string;
  movementNumber: string;
  movementOrigin: string;
  movementOriginCountry: string;
  movementDestination: string;
  shippingDetails: {
    modeOfTransport: string;
    carrierNumber: string;
    dateOfArrival: string;
    dateOfDeparture: string;
    timeOfDeparture: string;
    movementGMT: string;
    portOfLoad: string;
    portOfDischarge: string;
    originalLoadPort: string;
    destinationCountry: string;
    pointOfExit: string;
    LDMBusinessCode: string;
  };
  packageDetails: {
    packageType: string;
    numberOfPackages: number;
    containerNumber: string;
    cargoType: string;
    netWeight: number;
    netWeightUOM: UnitOfMeasurement;
    containerSize: string;
    containerType: string;
    containerSealNumber: string;
    grossWeight: number;
    grossWeightUOM: UnitOfMeasurement;
    volumetricWeight: number;
    volumetricWeightUOM: UnitOfMeasurement;
  };
}
