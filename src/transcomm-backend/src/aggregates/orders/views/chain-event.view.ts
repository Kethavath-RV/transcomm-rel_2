import { Prisma } from "@prisma/client";
import { ChainExceptionView } from "core";
import { OrderAggregate } from "../order-aggregate";

export class ChainEventView {
  HydrateChainEvents(
    aggregate: OrderAggregate
  ): Prisma.ChainEventCreateWithoutOrderInput[] {
    return aggregate.eventChain.map(x => {
      const exceptions = this.HydrateChainExceptions(x.exceptions);
      return {
        eventTime: x.eventTime,
        eventType: x.eventType,
        exceptions: { createMany: { data: exceptions } }
      }
    }
    );
  }

  private HydrateChainExceptions(
    exceptionViews: ChainExceptionView[]
  ): Prisma.ChainEventExceptionCreateWithoutChainEventInput[] {
    return exceptionViews.map(x => ({
      exceptionCode: x.exceptionCode,
      exceptionDetail: x.exceptionDetail
    }));
  }

}
