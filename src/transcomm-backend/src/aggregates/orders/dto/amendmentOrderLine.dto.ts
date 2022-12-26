import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { AmendmentOrderLine, GoodsCondition, UnitOfMeasurement } from 'core';

export class AmendmentOrderLineDto implements AmendmentOrderLine {
  lineNumber: number;
  @IsOptional()
  commodityCode?: string;
  @IsOptional()
  goodsCondition?: GoodsCondition;
  @IsOptional()
  description?: string;
  @IsOptional()
  quantity?: string;
  @IsOptional()
  quantityUnit?: UnitOfMeasurement;
  @IsOptional()
  @IsNumber()
  weight?: number;
  @IsOptional()
  weightUnit?: UnitOfMeasurement;
  @IsOptional()
  @IsInt()
  total?: number;
  @IsOptional()
  supplQuantityUnit?: UnitOfMeasurement;
}
