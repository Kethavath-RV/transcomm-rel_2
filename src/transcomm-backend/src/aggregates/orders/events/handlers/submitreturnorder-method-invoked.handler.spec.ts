import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Invoice, Movement } from 'core';
import { DatabaseService } from 'database/database.service';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { SubmitReturnOrderMethodInvokedEvent } from '../impl/submitreturnorder-method-invoked.event';
import { SubmitReturnOrderMethodInvokedHandler } from './submitreturnorder-method-invoked.handler';
import { Context, createMockContext, MockContext } from './__mocks__/prisma.mock';

describe('Submit OrderMode Final Method Invoked Handler', () => {
    let eventHandler: SubmitReturnOrderMethodInvokedHandler;
    let aggregateRepo: AggregateRepository;
    const aggregate = Mock<OrderAggregate>();
    let context: MockContext;
    let ctx: Context;
    let viewService: ViewsService;

    beforeEach(async () => {
        context = createMockContext();
        ctx = context as unknown as Context;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubmitReturnOrderMethodInvokedHandler,
                {
                    provide: AggregateRepository,
                    useValue: Mock<AggregateRepository>(),
                },
                {
                    provide: CommandBus,
                    useValue: Mock<CommandBus>()
                },
                { provide: DatabaseService, useValue: ctx.prisma },
                {
                    provide: ViewsService,
                    useValue: Mock<ViewsService>()
                }
            ],
        }).compile();
        eventHandler =
            module.get<SubmitReturnOrderMethodInvokedHandler>(
                SubmitReturnOrderMethodInvokedHandler,
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
        aggregate.movementData = {} as Movement;
        const request = new SubmitReturnOrderMethodInvokedEvent(
            'test',
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
    });

    it('if a retry - should create chain event and remove retry message', async () => {
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        aggregate.order.invoices = [Mock<Invoice>()];
        const request = new SubmitReturnOrderMethodInvokedEvent(
            'test',
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

    it('errors when no aggregate on retry', async () => {
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
        const request = new SubmitReturnOrderMethodInvokedEvent(
            'test',
            'test',
            'test',
            'test',
            'test',
            'test',
            'test',
            'test'
        );

        await expect(eventHandler.handle(request)).rejects.toThrow('No orderaggregate found for orderId: ' + request.aggregateId);
    });
});