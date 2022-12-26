import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { OrderAggregate } from "aggregates/orders/order-aggregate";
import { ViewsService } from "aggregates/orders/views/views.service";
import { ContractMethod } from "core";
import { DatabaseService } from "database/database.service";
import { AggregateRepository } from "event-sourcing";
import { SubmitOrderMethodInvokedEvent } from "../impl/submitorder-method-invoked.event";
import { closeManualRetryView } from "./helpers/update-manualRetryView";

@EventsHandler(SubmitOrderMethodInvokedEvent)
export class SubmitOrderMethodInvokedHandler implements IEventHandler<SubmitOrderMethodInvokedEvent>{
    private logger = new Logger(this.constructor.name);
    constructor(
        private readonly prisma: DatabaseService,
        private readonly viewService: ViewsService,
        private readonly repository: AggregateRepository) { }
    async handle(event: SubmitOrderMethodInvokedEvent): Promise<void> {
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
            const updateManualRetryViewRequest = closeManualRetryView(event.orderNumber,
                event.ecomCode,
                invoiceId,
                ContractMethod.SubmitOrderModeBasic,
                event.remark)
            await this.prisma.manualRetryView.update(updateManualRetryViewRequest)
        }

        await this.viewService.HydrateViews(orderAggregate);
    }
}
