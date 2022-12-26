import { Prisma } from "@prisma/client";
import { AddressType } from "core";
import { OrderAggregate } from "../order-aggregate";

export class AddressView {
  HydrateAddresses(
    aggregate: OrderAggregate
  ): Prisma.AddressCreateWithoutOrderInput[] {
    const { order } = aggregate;
    const result: Prisma.AddressCreateWithoutOrderInput[] = [];
    result.push({
      name: order.billTo ?? '',
      type: AddressType.bill,
      addressLine1: order.billToAddress?.addressLine1 ?? '',
      addressLine2: order.billToAddress?.addressLine2 ?? '',
      POBox: order.billToAddress?.POBox ?? '',
      city: order.billToAddress?.city ?? '',
      country: order.billToAddress?.country ?? '',
    });

    if (order.shipToAddress) {
      const shipToName = order.shipTo ? order.shipTo : '';
      result.push({
        name: shipToName,
        type: AddressType.ship,
        addressLine1: order.shipToAddress.addressLine1,
        addressLine2: order.shipToAddress.addressLine2,
        city: order.shipToAddress.city,
        country: order.shipToAddress.country,
        POBox: order.shipToAddress.POBox
      });
    }
    if (order.consigneeAddress) {
      const soldToName = order.consigneeName ? order.consigneeName : '';
      result.push({
        name: soldToName,
        type: AddressType.sold,
        addressLine1: order.consigneeAddress.addressLine1,
        addressLine2: order.consigneeAddress.addressLine2,
        city: order.consigneeAddress.city,
        country: order.consigneeAddress.country,
        POBox: order.consigneeAddress.POBox
      });
    }
    return result;
  }
}
