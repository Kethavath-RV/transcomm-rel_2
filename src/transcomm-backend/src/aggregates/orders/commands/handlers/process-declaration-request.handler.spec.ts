import { Test, TestingModule } from '@nestjs/testing';
import { OrderAggregate } from 'aggregates/orders/order-aggregate';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { DHLEDeclarationRequest } from 'core';
import { AggregateRepository } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { ProcessDeclarationRequestCommand } from '../impl/process-declaration-request';
import { ProcessDeclarationRequestCommandHandler } from './process-declaration-request.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

describe('Process declaration request command handler', () => {
  let commandHandler: ProcessDeclarationRequestCommandHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<OrderAggregate>();
  const aggregateKey = AggregateKey;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDeclarationRequestCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
      ],
    }).compile();
    commandHandler = module.get<ProcessDeclarationRequestCommandHandler>(
      ProcessDeclarationRequestCommandHandler,
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

    const command: ProcessDeclarationRequestCommand = {
      aggregateId: aggregateKey,
      orderId: aggregateKey.orderId,
      declarationRequestData: Mock<DHLEDeclarationRequest>(),
    };

    await commandHandler.execute(command);

    expect(aggregate.processDeclarationRequest).toBeCalled();
    expect(aggregate.commit).toBeCalled();
    expect(aggregate.addErrorEvent).not.toBeCalled();
  });

  it('should throw error when the aggregate is missing', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: ProcessDeclarationRequestCommand = {
      aggregateId: {} as OrderAggregateKey,
      orderId: '',
      declarationRequestData: Mock<DHLEDeclarationRequest>(),
    };
    await expect(commandHandler.execute(command)).rejects.toThrow();

    expect(aggregate.processDetailMovement).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
