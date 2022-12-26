import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { OrderAggregate } from "aggregates/orders/order-aggregate";
import { ViewsService } from "aggregates/orders/views/views.service";
import { ContractMethod } from "core";
import { DatabaseService } from "database/database.service";
import { AggregateRepository } from "event-sourcing";
import { InitiateDeclarationCallMethodInvokedForAmendmentEvent } from "../impl/initiatedeclarationcall-method-invoked-for-amendment.event";
import { closeManualRetryView } from "./helpers/update-manualRetryView";

@EventsHandler(InitiateDeclarationCallMethodInvokedForAmendmentEvent)
export class InitiateDeclarationCallMethodInvokedForAmendmentHandler implements IEventHandler<InitiateDeclarationCallMethodInvokedForAmendmentEvent>{
    private logger = new Logger(this.constructor.name);
    constructor(
        private readonly repository: AggregateRepository,
        private readonly prisma: DatabaseService,
        private readonly viewService: ViewsService

    ) { }
    async handle(event: InitiateDeclarationCallMethodInvokedForAmendmentEvent): Promise<void> {
        this.logger.debug(JSON.stringify(event));
        const orderAggregate = await this.repository.getById(OrderAggregate, 'order', event.aggregateId)
        if (!orderAggregate) {
            throw Error("No orderaggregate found for orderId: " + event.aggregateId)
        }
        if (event.retriedBy) {
            const invoiceId = orderAggregate.order.invoices.find(x => x)?.invoiceNumber;
            if (!invoiceId) {
                throw Error("No invoice found for orderId: " + orderAggregate.order.orderNumber)
            }
            const updateManualRetryViewRequest = closeManualRetryView(orderAggregate.order.orderNumber, orderAggregate.order.ecomBusinessCode, invoiceId, ContractMethod.InitiateDeclaration, event.remark)
            await this.prisma.manualRetryView.update(updateManualRetryViewRequest)
        }
        await this.viewService.HydrateViews(orderAggregate);
    }
}

