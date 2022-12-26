import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VcIdLookupAggregate } from 'aggregates/vcIdLookups/vcid-lookup-aggregate';
import { LookupType } from 'core';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { PerformVcIdLookupCommand } from '../impl/perform-lookup';
import { PerformVcIdLookupCommandHandler } from './perform-vcid-lookup.handler';

describe('perform vcId Lookup command handler', () => {
  let commandHandler: PerformVcIdLookupCommandHandler;
  let aggregateRepo: AggregateRepository;
  let publisher: StoreEventPublisher;
  const aggregate = Mock<VcIdLookupAggregate>();
  const vcId = "vcId";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerformVcIdLookupCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: StoreEventPublisher,
          useValue: Mock<StoreEventPublisher>(),
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler = module.get<PerformVcIdLookupCommandHandler>(PerformVcIdLookupCommandHandler);
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
    publisher = module.get<StoreEventPublisher>(StoreEventPublisher);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should perform lookup', async () => {
    aggregate.lookupType = LookupType.Order;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    jest
      .spyOn(publisher, 'mergeClassContext')
      .mockImplementation(() => class extends VcIdLookupAggregate { });

    const command: PerformVcIdLookupCommand = {
      vcId: vcId,
    };

    await commandHandler.execute(command);
    expect(aggregate.toggleOrderIsProcessed).toBeCalled();
  });

  it('should perform lookup - error', async () => {
    aggregate.lookupType = LookupType.Error;

    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);
    jest
      .spyOn(publisher, 'mergeClassContext')
      .mockImplementation(() => class extends VcIdLookupAggregate { });

    const command: PerformVcIdLookupCommand = {
      vcId: vcId,
    };

    await commandHandler.execute(command);
    expect(aggregate.toggleErrorIsProcessed).toBeCalled();
    expect(aggregate.toggleOrderIsProcessed).not.toBeCalled();
  });

  it('should not perform new lookup when aggregate doesnt exist', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command: PerformVcIdLookupCommand = {
      vcId: vcId,
    };

    await commandHandler.execute(command);
    expect(aggregate.toggleErrorIsProcessed).not.toBeCalled();
    expect(aggregate.toggleOrderIsProcessed).not.toBeCalled();
    expect(aggregate.commit).not.toBeCalled();
  });
});
