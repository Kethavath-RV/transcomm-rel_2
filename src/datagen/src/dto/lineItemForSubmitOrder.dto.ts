import {
  Country,
  GoodsCondition,
  ModeType,
  LineItemForSubmitOrder,
  UnitOfMeasurement,
  YesNo,
} from 'core';
import { DiscountDto } from './discount.dto';
import { DocumentDto } from './document.dto';
import { DutyDto } from './duty.dto';
import { ExemptionDto } from './exemption.dto';
import { PermitDto } from './permit.dto';
import { SubmitOrderSkuDto } from './submitOrderSku.dto';
import { VehicleDto } from './vehicle.dto';

export class LineItemForSubmitOrderDto implements LineItemForSubmitOrder {
  shippingParameterId: string;
  lineNo: number;
  mode: ModeType;
  quantity: number;
  quantityReturned: number;
  quantityUOM: UnitOfMeasurement;
  netWeight: number;
  netWeightUOM: UnitOfMeasurement;
  description: string;
  hscode: string;
  countryOfOrigin: Country;
  discount: DiscountDto;
  // dutyPaid: YesNo;
  // duties: DutyDto[];
  valueOfGoods: number;
  originalValueOfItem: number;
  isFreeOfCost: YesNo;
  goodsCondition: GoodsCondition;
  returnDays: number;
  supplementaryQuantity?: number;
  supplementaryQuantityUOM: UnitOfMeasurement;
  sku: SubmitOrderSkuDto;
  prevDeclarationReference: string;
  permits: PermitDto[];
  exemptions: ExemptionDto[];
  documents: DocumentDto[];
  vehicle: VehicleDto;
}
