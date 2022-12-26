import { Test, TestingModule } from '@nestjs/testing';
import { DeclarationResponse } from 'core';
import { mockDeep } from 'jest-mock-extended/lib/Mock';
import { BlessClientService } from '../../../../bless/bless-client/bless-client.service';
import { AggregateRepository } from '../../../../event-sourcing';
import { OrderAggregate } from '../../order-aggregate';
import { SendDHLEDeclarationResponseCommand } from '../impl/send-dhle-declaration-response';
import { SendDHLEDeclarationResponseHandler } from './send-dhle-declaration-response-command.handler';
import { AggregateKey } from './__mocks__/orderAggregate.mock';

const mockAggregateRepository = () => ({
  getById: jest.fn(),
});

const mockBlessService = () => ({
  postDeclarationResponse: jest.fn(),
});

let orderAggregate;

let aggregateRepository;
let blessService;
let handler;
const aggregateId = AggregateKey;

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: AggregateRepository, useFactory: mockAggregateRepository },
      { provide: BlessClientService, useFactory: mockBlessService },
      SendDHLEDeclarationResponseHandler,
    ],
  }).compile();

  aggregateRepository = module.get(AggregateRepository);
  blessService = module.get<BlessClientService>(BlessClientService);
  handler = module.get<SendDHLEDeclarationResponseHandler>(
    SendDHLEDeclarationResponseHandler,
  );
  orderAggregate = mockDeep<OrderAggregate>();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Send declaration response command handler', () => {
  it('throws an error if the key for the orderaggregate cannot be found', async () => {
    const command: SendDHLEDeclarationResponseCommand = {
      aggregateId: aggregateId,
      key: 'test',
    };
    aggregateRepository.getById.mockResolvedValue(null);
    await expect(handler.execute(command)).rejects.toThrow(
      `No order aggregate found for aggregate id: ${aggregateId.key()}`,
    );
    expect(aggregateRepository.getById).toBeCalledTimes(1);
    expect(orderAggregate.commit).not.toBeCalled();
  });

  it('invokes addErrorEvent if there is no declarationResponse ', async () => {
    const command: SendDHLEDeclarationResponseCommand = {
      aggregateId: aggregateId,
      key: 'test',
    };
    aggregateRepository.getById.mockResolvedValue(orderAggregate);
    orderAggregate.getDeclarationResponseFromMapping.mockImplementationOnce(
      new Error('Test'),
    );
    await handler.execute(command);
    expect(orderAggregate.getDeclarationResponseFromMapping).toBeCalledTimes(1);
    expect(orderAggregate.addErrorEvent).toBeCalledTimes(1);
    expect(orderAggregate.commit).toBeCalledTimes(1);
  });

  it('sends bless message and saves event if order aggregate is found and corresponding mapped DHLE declaration is filled', async () => {
    const command: SendDHLEDeclarationResponseCommand = {
      aggregateId: aggregateId,
      key: 'test',
    };
    aggregateRepository.getById.mockResolvedValue(orderAggregate);
    orderAggregate.getDeclarationResponseFromMapping.mockReturnValue(
      mockDeep<DeclarationResponse>(),
    );
    await handler.execute(command);
    expect(orderAggregate.getDeclarationResponseFromMapping).toBeCalledTimes(1);
    expect(blessService.postDeclarationResponse).toBeCalledTimes(1);
    expect(orderAggregate.processDeclarationResponseSentEvent).toBeCalledTimes(
      1,
    );
    expect(orderAggregate.commit).toBeCalledTimes(1);
  });
});
