import {
  Country,
  GoodsCondition,
  LineItem,
  ModeType,
  UnitOfMeasurement,
  YesNo,
} from 'core';
import { DiscountDto } from './discount.dto';
import { DocumentDto } from './document.dto';
import { DutyDto } from './duty.dto';
import { ExemptionDto } from './exemption.dto';
import { PermitDto } from './permit.dto';
import { SkuDto } from './sku.dto';
import { VehicleDto } from './vehicle.dto';

export class LineItemDto implements LineItem {
  shippingParameterId: string;
  lineNo: number;
  actionDate: string;
  mode: ModeType;
  quantityReturned: number;
  quantity: number;
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
  prevDeclarationReference: string;
  permits: PermitDto[];
  sku: SkuDto;
  exemptions: ExemptionDto[];
  documents: DocumentDto[];
  vehicle: VehicleDto;
}
