import { Discount } from 'core';

export class DiscountDto implements Discount {
  value?: number;
  percentage?: number;
}
