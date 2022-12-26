import { CreateAirwayBillToOrderIdLookupHandler } from './create-airwaybillno-orderid-lookup.handler';
import { PerformDetailToOrderIdLookupCommandHandler } from './perform-detail-lookup.handler';
import { PerformAirwayBillNoToOrderIdLookupDHLECommandHandler } from './perform-dhle-lookup.handler';
import { PerformAirwayBillNoToOrderIdLookupMovementCommandHandler } from './perform-movement-lookup.handler';

export const CommandHandlers = [
  CreateAirwayBillToOrderIdLookupHandler,
  PerformAirwayBillNoToOrderIdLookupMovementCommandHandler,
  PerformAirwayBillNoToOrderIdLookupDHLECommandHandler,
  PerformDetailToOrderIdLookupCommandHandler,
];
