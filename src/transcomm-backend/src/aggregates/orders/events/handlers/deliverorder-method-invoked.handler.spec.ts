import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Invoice } from 'core';
import { DatabaseService } from 'database/database.service';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { DeliverOrderMethodInvokedEvent } from '../impl/deliverorder-method-invoked.event';
import { DeliverOrderMethodInvokedEventHandler } from './deliverorder-method-invoked.handler';
import { Context, createMockContext, MockContext } from './__mocks__/prisma.mock';

describe('Deliver Order Method Invoked Event Handler', () => {
    let eventHandler: DeliverOrderMethodInvokedEventHandler;
    let aggregateRepo: AggregateRepository;
    let viewService: ViewsService;
    const aggregate = Mock<OrderAggregate>();
    let context: MockContext;
    let ctx: Context;

    beforeEach(async () => {
        context = createMockContext();
        ctx = context as unknown as Context;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeliverOrderMethodInvokedEventHandler,
                {
                    provide: AggregateRepository,
                    useValue: Mock<AggregateRepository>(),
                },
                { provide: DatabaseService, useValue: ctx.prisma },
                {
                    provide: ViewsService,
                    useValue: Mock<ViewsService>()
                },
            ],
        }).compile();
        eventHandler =
            module.get<DeliverOrderMethodInvokedEventHandler>(
                DeliverOrderMethodInvokedEventHandler,
            );
        aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
        viewService = module.get<ViewsService>(ViewsService);
    });

    afterEach(async () => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(eventHandler).toBeDefined();
    });

    it('should create chain event', async () => {
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        const request = new DeliverOrderMethodInvokedEvent(
            'test',
            'test',
            'test',
            'test',
            'test',
            null,
            'test'
        );
        await eventHandler.handle(request);
        expect(viewService.HydrateViews).toBeCalled();
        expect(ctx.prisma.manualRetryView.update).not.toBeCalled();

    });

    it('if a retry - should create chain event and remove retry message', async () => {
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        aggregate.order.invoices = [Mock<Invoice>()];
        const request = new DeliverOrderMethodInvokedEvent(
            'test',
            'test',
            'test',
            'test',
            'test',
            'test',
            'test'
        );
        await eventHandler.handle(request);
        expect(ctx.prisma.manualRetryView.update).toBeCalled();
        expect(viewService.HydrateViews).toBeCalled();
    });
});