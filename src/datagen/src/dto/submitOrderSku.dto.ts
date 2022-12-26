import { SubmitOrderSku } from 'core';

export class SubmitOrderSkuDto implements SubmitOrderSku {
  productCode?: string;
  quantityUOM?: string;
  unitPrice?: number;
}
