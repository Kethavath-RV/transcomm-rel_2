import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TxnLookup } from '@prisma/client';
import {
  ConfirmReturnDeliveryParameters,
  DeliverOrderParameters,
  HyperledgerResponse,
  InitiateDeclarationParameters,
  SubmitOrderParameters,
  SubmitOrderParametersForReturn,
  UpdateExitConfirmationParameters,
  UpdateTransportInfoParameters,
} from 'core';
import { DatabaseService } from 'database/database.service';
import { HyperledgerEventNames } from 'hyperledger/constants/hyperledger-events';
import { mock, mockDeep, MockProxy } from 'jest-mock-extended';
import {
  submitOrderParametersAfterTransientTransformResult,
  submitOrderParametersMock,
} from '../../test/mockdata/submitOrderParamMock';
import { HyperledgerEventsService } from '../database/hyperledger-events.service';
import { DataTransformerService } from '../dataTransformer/data-transformer.service';
import { ConfirmReturnDeliveryDatagenParametersDto } from '../dto/confirmReturnDeliveryDatagenParameters.dto';
import { DeliverOrderDatagenParametersDto } from '../dto/deliverOrderDatagenParameters.dto';
import { InitiateDeclarationDatagenParametersDto } from '../dto/initiateDeclarationDatagenParameters.dto';
import { ReturnOrderDatagenParametersDto } from '../dto/returnOrderDatagenParameters.dto';
import { SubmitOrderDatagenParametersDto } from '../dto/submitOrderDatagenParameters.dto';
import { UpdateExitConfirmationDatagenParametersDto } from '../dto/updateExitConfirmationDatagenParameters.dto';
import { UpdateTransportInfoDatagenParametersDto } from '../dto/updateTransportInfoDatagenParameters.dto';
import { HyperledgerClientService } from '../hyperledger/hyperledger-client/hyperledger-client.service';
import { ServicelayerService } from './servicelayer.service';

export type Context = {
  hlClientService: HyperledgerClientService;
  hlEventService: HyperledgerEventsService;
  dataTransformerService: DataTransformerService;
};

export type MockContext = {
  hlClientService: MockProxy<HyperledgerClientService>;
  hlEventService: MockProxy<HyperledgerEventsService>;
  dataTransformerService: MockProxy<DataTransformerService>;
};

export const createMockContext = (): MockContext => {
  return {
    hlClientService: mock<HyperledgerClientService>(),
    hlEventService: mock<HyperledgerEventsService>(),
    dataTransformerService: mock<DataTransformerService>(),
  };
};

const mockTxnLookup = mock<TxnLookup>();

const mockHLResponse = mock<HyperledgerResponse>();

describe('ServicelayerService', () => {
  let service: ServicelayerService;
  let context: MockContext;

  beforeEach(async () => {
    context = createMockContext();
    const mockConfig = {
      get: jest.fn((key: string) => {
        // this is being super extra, in the case that you need multiple keys with the `get` method
        if (key === 'DATAGEN_URL') {
          return 'http://datagen:5050';
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicelayerService,
        {
          provide: HyperledgerClientService,
          useValue: context.hlClientService,
        },
        {
          provide: DataTransformerService,
          useValue: context.dataTransformerService,
        },
        { provide: HyperledgerEventsService, useValue: context.hlEventService },
        { provide: DatabaseService, useValue: {} },
        { provide: ConfigService, useValue: mockConfig },
      ],
    })
      .setLogger(mock<Logger>())
      .compile();

    service = module.get<ServicelayerService>(ServicelayerService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should invokeHLSubmitOrder', async () => {
    mockHLResponse.error = '';
    const transformSubmitOrder =
      context.dataTransformerService.transformSubmitOrder.mockResolvedValue(
        mock<SubmitOrderParameters>(),
      );
    const invokeSubmitOrder =
      context.hlClientService.invokeSubmitOrder.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLSubmitOrder(
      mock<SubmitOrderDatagenParametersDto>(),
    );
    expect(transformSubmitOrder).toBeCalledTimes(1);
    expect(invokeSubmitOrder).toBeCalledTimes(1);
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLReturnOrder', async () => {
    mockHLResponse.error = '';
    const transformSubmitOrderForReturn =
      context.dataTransformerService.transformSubmitOrderForReturn.mockResolvedValue(
        mock<SubmitOrderParametersForReturn>(),
      );
    const invokeSubmitOrder =
      context.hlClientService.invokeSubmitOrder.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLReturnOrder(
      mock<ReturnOrderDatagenParametersDto>(),
    );
    expect(transformSubmitOrderForReturn).toBeCalledTimes(1);
    expect(invokeSubmitOrder).toBeCalledTimes(1);
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLUpdateTransportInfo for outbound order', async () => {
    const request = mock<UpdateTransportInfoDatagenParametersDto>();
    request.returnRequest = undefined; // set as outbound order
    mockHLResponse.error = '';
    const transformUpdateTransportInfoReturn =
      context.dataTransformerService.transformUpdateTransportInfoReturn.mockResolvedValue(
        mockDeep<UpdateTransportInfoParameters>(),
      );
    const transformUpdateTransportInfo =
      context.dataTransformerService.transformUpdateTransportInfo.mockResolvedValue(
        mock<UpdateTransportInfoParameters>(),
      );
    const invokeUpdateTransportInfo =
      context.hlClientService.invokeUpdateTransportInfo.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLUpdateTransportInfo(request);
    expect(transformUpdateTransportInfoReturn).not.toBeCalled();
    expect(transformUpdateTransportInfo).toBeCalledTimes(1);
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(invokeUpdateTransportInfo).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLUpdateTransportInfo for inbound order (return)', async () => {
    const request = mock<UpdateTransportInfoDatagenParametersDto>();
    mockHLResponse.error = '';
    const transformUpdateTransportInfoReturn =
      context.dataTransformerService.transformUpdateTransportInfoReturn.mockResolvedValue(
        mockDeep<UpdateTransportInfoParameters>(),
      );
    const transformUpdateTransportInfo =
      context.dataTransformerService.transformUpdateTransportInfo.mockResolvedValue(
        mock<UpdateTransportInfoParameters>(),
      );
    const invokeUpdateTransportInfo =
      context.hlClientService.invokeUpdateTransportInfo.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLUpdateTransportInfo(request);
    expect(transformUpdateTransportInfoReturn).toBeCalledTimes(1);
    expect(transformUpdateTransportInfo).not.toBeCalled();
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(invokeUpdateTransportInfo).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLInitiateDeclaration', async () => {
    mockHLResponse.error = '';
    const transformInitiateDeclaration =
      context.dataTransformerService.transformInitiateDeclaration.mockResolvedValue(
        mock<InitiateDeclarationParameters>(),
      );
    const invokeInitiateDeclaration =
      context.hlClientService.invokeInitiateDeclaration.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLInitiateDeclaration(
      mock<InitiateDeclarationDatagenParametersDto>(),
    );
    expect(transformInitiateDeclaration).toBeCalledTimes(1);
    expect(invokeInitiateDeclaration).toBeCalledTimes(1);
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLDeliverOrder for outbound order', async () => {
    const request = mock<DeliverOrderDatagenParametersDto>();
    request.returnRequest = undefined; // set as outbound order
    mockHLResponse.error = '';
    const transformReturnDeliverOrder =
      context.dataTransformerService.transformReturnDeliverOrder.mockResolvedValue(
        mockDeep<DeliverOrderParameters>(),
      );
    const transformDeliverOrder =
      context.dataTransformerService.transformDeliverOrder.mockResolvedValue(
        mock<DeliverOrderParameters>(),
      );
    const invokeDeliverOrder =
      context.hlClientService.invokeDeliverOrder.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLDeliverOrder(request);
    expect(transformReturnDeliverOrder).not.toBeCalled();
    expect(transformDeliverOrder).toBeCalledTimes(1);
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(invokeDeliverOrder).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLDeliverOrder for inbound order (return)', async () => {
    const request = mock<DeliverOrderDatagenParametersDto>();
    mockHLResponse.error = '';
    const transformReturnDeliverOrder =
      context.dataTransformerService.transformReturnDeliverOrder.mockResolvedValue(
        mockDeep<DeliverOrderParameters>(),
      );
    const transformDeliverOrder =
      context.dataTransformerService.transformDeliverOrder.mockResolvedValue(
        mock<DeliverOrderParameters>(),
      );
    const invokeDeliverOrder =
      context.hlClientService.invokeDeliverOrder.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLDeliverOrder(request);
    expect(transformReturnDeliverOrder).toBeCalledTimes(1);
    expect(transformDeliverOrder).not.toBeCalled();
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(invokeDeliverOrder).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLConfirmReturnDelivery', async () => {
    mockHLResponse.error = '';
    const transformConfirmReturnDelivery =
      context.dataTransformerService.transformConfirmReturnDelivery.mockResolvedValue(
        mock<ConfirmReturnDeliveryParameters>(),
      );
    const invokeConfirmReturnDelivery =
      context.hlClientService.invokeConfirmReturnDelivery.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLConfirmReturnDelivery(
      mock<ConfirmReturnDeliveryDatagenParametersDto>(),
    );
    expect(transformConfirmReturnDelivery).toBeCalledTimes(1);
    expect(invokeConfirmReturnDelivery).toBeCalledTimes(1);
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should invokeHLUpdateExitConfirmation', async () => {
    mockHLResponse.error = '';
    const transformUpdateExitConfirmation =
      context.dataTransformerService.transformUpdateExitConfirmation.mockResolvedValue(
        mock<UpdateExitConfirmationParameters>(),
      );
    const invokeUpdateExitConfirmation =
      context.hlClientService.invokeUpdateExitConfirmation.mockResolvedValue(
        mockHLResponse,
      );
    const createTxnLookup =
      context.hlEventService.createTxnLookup.mockResolvedValue(mockTxnLookup);
    const result = await service.invokeHLUpdateExitConfirmation(
      mock<UpdateExitConfirmationDatagenParametersDto>(),
    );
    expect(transformUpdateExitConfirmation).toBeCalledTimes(1);
    expect(invokeUpdateExitConfirmation).toBeCalledTimes(1);
    expect(createTxnLookup).toBeCalledTimes(1);
    expect(result.message.txnId).toBe(mockHLResponse.message.txnId);
  });

  it('should ping HL', async () => {
    const ping = context.hlClientService.ping.mockResolvedValue({
      message: 'ok',
    });
    const result = await service.pingHL();
    expect(ping).toBeCalledTimes(1);
    expect(result.message).toBeDefined();
  });

  it('should unsubscribeFromAllCurrentEvents', async () => {
    const subIds = ['12234', '123412', '12312'];
    const currentSubs =
      context.hlClientService.getCurrentSubscriptions.mockResolvedValue({
        message: [
          {
            chaincodeName: 'chain',
            channelName: 'chain',
            eventCategory: 'cat',
            subscriptionIds: subIds,
          },
        ],
        error: 'none',
      });

    const unsub = context.hlClientService.unsubscribeToEvents.mockResolvedValue(
      {
        message: { subscriptionId: 'id' },
        error: 'none',
      },
    );
    await service.unsubscribeFromAllCurrentEvents();
    expect(currentSubs).toBeCalledTimes(1);
    expect(unsub).toBeCalledTimes(subIds.length);
  });

  it('should check HL subscriptions, update one', async () => {
    const subIds = ['12234', '123412', '12312'];
    const currentSubs =
      context.hlClientService.getCurrentSubscriptions.mockResolvedValue({
        message: [
          {
            chaincodeName: 'chain',
            channelName: 'chain',
            eventCategory: 'cat',
            subscriptionIds: subIds,
          },
        ],
        error: 'none',
      });

    const highestBlock =
      context.hlEventService.findStartingBlock.mockResolvedValue([
        { highestBlockNumber: 1, eventName: HyperledgerEventNames.chain },
        { highestBlockNumber: 2, eventName: HyperledgerEventNames.claim },
      ]);
    const subscribe =
      context.hlClientService.subscribeToEvents.mockResolvedValue({
        message: {
          subscriptionId: '12',
        },
        error: 'none',
      });

    const unsub = context.hlClientService.unsubscribeToEvents.mockResolvedValue(
      {
        message: { subscriptionId: 'id' },
        error: 'none',
      },
    );

    await service.initialiseSubscriptions();
    expect(currentSubs).toBeCalledTimes(1);
    expect(highestBlock).toBeCalledTimes(1);
    expect(subscribe).toBeCalledTimes(3);
    expect(unsub).toBeCalledTimes(subIds.length);

    await service.checkHLSubscriptions();
    expect(currentSubs).toBeCalledTimes(2);
    expect(subscribe).toBeCalledTimes(4);
  });

  it('should check HL subscriptions, update none', async () => {
    const subIds = ['12234', '123412', '12312'];
    const currentSubs =
      context.hlClientService.getCurrentSubscriptions.mockResolvedValue({
        message: [
          {
            chaincodeName: 'chain',
            channelName: 'chain',
            eventCategory: 'cat',
            subscriptionIds: subIds,
          },
        ],
        error: 'none',
      });

    const highestBlock =
      context.hlEventService.findStartingBlock.mockResolvedValue([
        { highestBlockNumber: 1, eventName: HyperledgerEventNames.chain },
        { highestBlockNumber: 2, eventName: HyperledgerEventNames.claim },
      ]);
    const subscribe =
      context.hlClientService.subscribeToEvents.mockResolvedValue({
        message: {
          subscriptionId: '12234',
        },
        error: 'none',
      });

    const unsub = context.hlClientService.unsubscribeToEvents.mockResolvedValue(
      {
        message: { subscriptionId: 'id' },
        error: 'none',
      },
    );

    await service.initialiseSubscriptions();
    expect(currentSubs).toBeCalledTimes(1);
    expect(highestBlock).toBeCalledTimes(1);
    expect(subscribe).toBeCalledTimes(3);
    expect(unsub).toBeCalledTimes(subIds.length);

    await service.checkHLSubscriptions();
    expect(currentSubs).toBeCalledTimes(2);
    expect(subscribe).toBeCalledTimes(3);
  });

  it('should initialiseSubscriptions', async () => {
    const subIds = ['12234', '123412', '12312'];
    const currentSubs =
      context.hlClientService.getCurrentSubscriptions.mockResolvedValue({
        message: [
          {
            chaincodeName: 'chain',
            channelName: 'chain',
            eventCategory: 'cat',
            subscriptionIds: subIds,
          },
        ],
        error: 'none',
      });

    const highestBlock =
      context.hlEventService.findStartingBlock.mockResolvedValue([
        { highestBlockNumber: 1, eventName: HyperledgerEventNames.chain },
        { highestBlockNumber: 2, eventName: HyperledgerEventNames.claim },
      ]);
    const subscribe =
      context.hlClientService.subscribeToEvents.mockResolvedValue({
        message: {
          subscriptionId: '123142',
        },
        error: 'none',
      });

    const unsub = context.hlClientService.unsubscribeToEvents.mockResolvedValue(
      {
        message: { subscriptionId: 'id' },
        error: 'none',
      },
    );
    await service.initialiseSubscriptions();
    expect(currentSubs).toBeCalledTimes(1);
    expect(highestBlock).toBeCalledTimes(1);
    expect(subscribe).toBeCalledTimes(3);
    expect(unsub).toBeCalledTimes(subIds.length);
  });

  it('should createTransientValuesWithPipes', async () => {
    const payload: SubmitOrderParameters = submitOrderParametersMock;
    const expected = submitOrderParametersAfterTransientTransformResult;
    const res = service.createTransientValuesWithPipesForSubmitOrder(payload);

    expect(res).toEqual(expected);
  });
});
