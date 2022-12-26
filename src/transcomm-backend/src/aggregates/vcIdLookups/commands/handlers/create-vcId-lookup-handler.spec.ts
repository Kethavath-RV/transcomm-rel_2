import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VcIdLookupAggregate } from 'aggregates/vcIdLookups/vcid-lookup-aggregate';
import { LookupType } from 'core';
import { AggregateRepository, StoreEventPublisher } from 'event-sourcing';
import Mock from 'jest-mock-extended/lib/Mock';
import { CreateVcIdLookupCommand } from '../impl/create-vcId-lookup';
import { CreateVcIdLookupCommandHandler } from './create-vcid-lookup.handler';

describe('create vcId Lookup command handler', () => {
  let commandHandler: CreateVcIdLookupCommandHandler;
  let aggregateRepo: AggregateRepository;
  const aggregate = Mock<VcIdLookupAggregate>();
  const newaggregate = Mock<VcIdLookupAggregate>();
  const vcId = "vcId";

  const mockPublisher = {
    mergeClassContext() { 
      return jest.fn().mockImplementation(() => { return newaggregate }) 
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVcIdLookupCommandHandler,
        {
          provide: AggregateRepository,
          useValue: Mock<AggregateRepository>(),
        },
        {
          provide: StoreEventPublisher,
          useValue: mockPublisher,
        },
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    commandHandler = module.get<CreateVcIdLookupCommandHandler>(CreateVcIdLookupCommandHandler);
    aggregateRepo = module.get<AggregateRepository>(AggregateRepository);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(commandHandler).toBeDefined();
  });

  it('should create new lookup', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command: CreateVcIdLookupCommand = {
      vcId: vcId,
      orderNumber: "testOrderNumber",
      ecomCode: "testEcomCode",
      lookupType: LookupType.Order,
    };

    await commandHandler.execute(command);
    expect(newaggregate.createVcIdLookupForOrder).toBeCalled();
  });

  it('should create new lookup - error', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(null);

    const command: CreateVcIdLookupCommand = {
      vcId: vcId,
      orderNumber: "testOrderNumber",
      ecomCode: "testEcomCode",
      lookupType: LookupType.Error,
    };

    await commandHandler.execute(command);
    expect(newaggregate.createVcIdLookupForError).toBeCalled();
    expect(newaggregate.createVcIdLookupForOrder).not.toBeCalled();
  });

  it('should not create new lookup aggregate when one exists', async () => {
    jest.spyOn(aggregateRepo, 'getById').mockResolvedValue(aggregate);

    const command: CreateVcIdLookupCommand = {
      vcId: vcId,
      orderNumber: "testOrderNumber",
      ecomCode: "testEcomCode",
      lookupType: LookupType.Order,
    };

    await commandHandler.execute(command);
    expect(aggregate.createVcIdLookupForOrder).not.toBeCalled();
  });
});
