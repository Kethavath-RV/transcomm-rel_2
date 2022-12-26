import { Sku } from 'core';

export class SkuDto implements Sku {
  quantityUOM: string;
  productCode: string;
}
