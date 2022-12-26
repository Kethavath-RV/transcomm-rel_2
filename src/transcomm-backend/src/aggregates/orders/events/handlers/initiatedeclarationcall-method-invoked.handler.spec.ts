import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { ViewsService } from 'aggregates/orders/views/views.service';
import { Invoice, Order } from 'core';
import { DatabaseService } from 'database/database.service';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { InitiateDeclarationCallMethodInvokedEvent } from '../impl/initiatedeclarationcall-method-invoked.event';
import { InitiateDeclarationCallMethodInvokedHandler } from './initiatedeclarationcall-method-invoked.handler';
import { Context, createMockContext, MockContext } from './__mocks__/prisma.mock';

describe('confirm return delivery method invoked event', () => {
    let context: MockContext;
    let ctx: Context;
    let eventHandler: InitiateDeclarationCallMethodInvokedHandler;
    let aggregateRepo: AggregateRepository;
    let viewService: ViewsService;
    const aggregate = Mock<OrderAggregate>();
    const mockOrder = Mock<Order>();
    const mockInvoice = Mock<Invoice>();

    beforeEach(async () => {
        context = createMockContext();
        ctx = context as unknown as Context;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InitiateDeclarationCallMethodInvokedHandler,
                {
                    provide: DatabaseService,
                    useValue: ctx.prisma,
                },
                {
                    provide: AggregateRepository,
                    useValue: Mock<AggregateRepository>(),
                },
                {
                    provide: ViewsService,
                    useValue: Mock<ViewsService>()
                },
            ]
        }).compile();

        eventHandler = module.get<InitiateDeclarationCallMethodInvokedHandler>(
            InitiateDeclarationCallMethodInvokedHandler,
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


    it('should handle initiate succesfully', async () => {
        const event = new InitiateDeclarationCallMethodInvokedEvent('test', 'test', 'test', null, 'test');
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        await eventHandler.handle(event);
        expect(viewService.HydrateViews).toBeCalledTimes(1);
    });

    it('should handle correctly with retry set succesfully', async () => {
        const invoiceNumber = 'testInvoice';
        mockInvoice.invoiceNumber = invoiceNumber;
        mockOrder.invoices = [mockInvoice];
        aggregate.order = mockOrder;
        const event = new InitiateDeclarationCallMethodInvokedEvent('test', 'test', 'test', 'me', 'test');
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
        await eventHandler.handle(event);
        expect(viewService.HydrateViews).toBeCalledTimes(1);
        expect(ctx.prisma.manualRetryView.update).toBeCalledTimes(1);
    });

    it('should error no aggregate', async () => {
        jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);
        const event = new InitiateDeclarationCallMethodInvokedEvent('test', 'test', 'test', 'test', 'test');

        await expect(eventHandler.handle(event)).rejects.toThrow('No orderaggregate found for orderId: ' + event.aggregateId);
    });
});