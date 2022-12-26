import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { OrderAggregate } from "aggregates/orders/order-aggregate";
import { ViewsService } from "aggregates/orders/views/views.service";
import { ContractMethod } from "core";
import { DatabaseService } from "database/database.service";
import { AggregateRepository } from "event-sourcing";
import { UpdateTransportInfoMethodInvokedEvent } from "../impl/updatetransportinfo-method-invoked.event";
import { closeManualRetryView } from "./helpers/update-manualRetryView";

@EventsHandler(UpdateTransportInfoMethodInvokedEvent)
export class UpdateTransportInfoMethodInvokedHandler
    implements IEventHandler<UpdateTransportInfoMethodInvokedEvent>
{
    private logger = new Logger(this.constructor.name);

    constructor(
        private readonly prisma: DatabaseService,
        private readonly repository: AggregateRepository,
        private readonly viewService: ViewsService) { }

    async handle(event: UpdateTransportInfoMethodInvokedEvent): Promise<void> {
        this.logger.debug(JSON.stringify(event));
        const orderAggregate = await this.repository.getById(OrderAggregate, 'order', event.aggregateId)
        if (!orderAggregate) {
            throw Error("No orderaggregate found for orderId: " + event.aggregateId)
        }
        if (event.retriedBy) {
            const invoiceId = orderAggregate.order.invoices[0].invoiceNumber
            if (!invoiceId) {
                throw Error("No invoice found for orderId: " + event.orderNumber)
            }
            const updateManualRetryViewRequest = closeManualRetryView(event.orderNumber, event.ecomCode, invoiceId, ContractMethod.UpdateTransportInfo, event.remark)
            await this.prisma.manualRetryView.update(updateManualRetryViewRequest)
        }
        this.viewService.HydrateViews(orderAggregate);
    }
}
