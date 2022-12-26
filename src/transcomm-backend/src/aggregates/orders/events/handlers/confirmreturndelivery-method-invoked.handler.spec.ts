import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Invoice, Order } from 'core';
import { DatabaseService } from 'database/database.service';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ConfirmReturnDeliveryMethodInvokedEvent } from '../impl/confirmreturndelivery-method-invoked.event';
import { ConfirmReturnDeliveryMethodInvokedEventHandler } from './confirmreturndelivery-method-invoked.handler';
import { Context, createMockContext, MockContext } from './__mocks__/prisma.mock';

describe('confirm return delivery method invoked event', () => {
    let context: MockContext;
    let ctx: Context;
    let viewService: ViewsService;
    let eventHandler: ConfirmReturnDeliveryMethodInvokedEventHandler;
    let aggregateRepo: AggregateRepository;
    const aggregate = Mock<OrderAggregate>();
    const mockOrder = Mock<Order>();
    const mockInvoice = Mock<Invoice>();

    beforeEach(async () => {
        context = createMockContext();
        ctx = context as unknown as Context;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConfirmReturnDeliveryMethodInvokedEventHandler,
                {
                    provide: AggregateRepository,
                    useValue: Mock<AggregateRepository>(),
                },
                {
                    provide: ViewsService,
                    useValue: Mock<ViewsService>()
                },
                {
                    provide: DatabaseService,
                    useValue: ctx.prisma,
                },
            ]
        }).compile();

        eventHandler = module.get<ConfirmReturnDeliveryMethodInvokedEventHandler>(
            ConfirmReturnDeliveryMethodInvokedEventHandler,
        );
        aggregateRepo = module.get<AggregateRepository>(
            AggregateRepository
        );
        viewService = module.get<ViewsService>(
            ViewsService
        );
    });

    afterEach(async () => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(eventHandler).toBeDefined();
    });


    it('should handle confirm succesfully', async () => {
        const event = new ConfirmReturnDeliveryMethodInvokedEvent('test', 'test', 'test', 'test', 'test', null, 'test');
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        await eventHandler.handle(event);
        expect(viewService.HydrateViews).toBeCalledTimes(1);
    });

    it('should handle correctly with retry set succesfully', async () => {
        const invoiceNumber = 'testInvoice';
        mockInvoice.invoiceNumber = invoiceNumber;
        mockOrder.invoices = [mockInvoice];
        aggregate.order = mockOrder;
        const event = new ConfirmReturnDeliveryMethodInvokedEvent('test', 'test', 'test', 'test', 'test', 'me', 'test');
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        await eventHandler.handle(event);
        expect(viewService.HydrateViews).toBeCalledTimes(1);
        expect(ctx.prisma.manualRetryView.update).toBeCalledTimes(1);

    });

    it('should error no aggregate', async () => {
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
        const event = new ConfirmReturnDeliveryMethodInvokedEvent('test', 'test', 'test', 'test', 'test', null, 'test');

        await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
    });

    it('retry fails no invoice', async () => {
        mockOrder.invoices = [];
        aggregate.order = mockOrder;
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        const event = new ConfirmReturnDeliveryMethodInvokedEvent('test', 'test', 'test', 'test', 'test', 'me', 'test');

        await expect(eventHandler.handle(event)).rejects.toThrow("No invoice found for orderId: " + mockOrder.orderNumber);
    });
});