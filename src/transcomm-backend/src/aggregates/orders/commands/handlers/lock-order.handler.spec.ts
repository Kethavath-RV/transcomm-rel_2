import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { LockOrderCommand } from '../impl/lock-order';
import { LockOrderCommandHandler } from './lock-order.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('lock order handler', () => {
  let commandHandler: LockOrderCommandHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockOrderCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    commandHandler = module.get<LockOrderCommandHandler>(
      LockOrderCommandHandler,
    );
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should commit without errors', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: LockOrderCommand = {
      aggregateId: aggregateKey,
      orderNumber: aggregateKey.orderId,
      invoiceNumber: '',
      username: '',
    };
    await commandHandler.execute(command);

    expect(aggregate.lockOrder).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error when the aggregate is missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: LockOrderCommand = {
      aggregateId: {} as OrderAggregateKey,
      orderNumber: aggregateKey.orderId,
      invoiceNumber: '',
      username: '',
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.lockOrder).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
