import { Logger } from "@nestjs/common";
import { CommandBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { InvokeSubmitOrderModeFinalMethodCommand } from "aggregates/orders/commands/impl/invoke-submitordermodefinal-method";
import { OrderAggregate } from "aggregates/orders/order-aggregate";
import { OrderAggregateKey } from "aggregates/orders/order-aggregate-key";
import { ViewsService } from "aggregates/orders/views/views.service";
import { ContractMethod } from "core";
import { DatabaseService } from "database/database.service";
import { AggregateRepository } from "event-sourcing";
import { SubmitCancelOrderMethodInvokedEvent } from "../impl/submitcancelorder-method-invoked.event";
import { closeManualRetryView } from "./helpers/update-manualRetryView";

@EventsHandler(SubmitCancelOrderMethodInvokedEvent)
export class SubmitCancelOrderMethodInvokedHandler implements IEventHandler<SubmitCancelOrderMethodInvokedEvent>{
    private logger = new Logger(this.constructor.name);
    constructor(
        private readonly prisma: DatabaseService,
        private readonly repository: AggregateRepository,
        private readonly commandBus: CommandBus,
        private readonly viewService: ViewsService
    ) { }
    async handle(event: SubmitCancelOrderMethodInvokedEvent): Promise<void> {
        this.logger.debug(JSON.stringify(event));

        this.commandBus.execute(new InvokeSubmitOrderModeFinalMethodCommand(
            new OrderAggregateKey(event.orderNumber, event.ecomCode), event.orderNumber, event.ecomCode, null)
        );

        const orderAggregate = await this.repository.getById(OrderAggregate, 'order', event.aggregateId)
        if (!orderAggregate) {
            throw Error("No orderaggregate found for orderId: " + event.aggregateId)
        }
        if (event.retriedBy) {
            const invoiceId = orderAggregate.order.invoices[0].invoiceNumber
            if (!invoiceId) {
                throw Error("No invoice found for orderId: " + event.orderNumber)
            }
            const updateManualRetryViewRequest = closeManualRetryView(event.orderNumber, event.ecomCode, invoiceId, ContractMethod.SubmitOrderModeCancel, event.remark)
            await this.prisma.manualRetryView.update(updateManualRetryViewRequest)
        }

        await this.viewService.HydrateViews(orderAggregate);
    }
}
