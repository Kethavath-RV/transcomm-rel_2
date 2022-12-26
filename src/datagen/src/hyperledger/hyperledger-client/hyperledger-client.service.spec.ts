import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError } from 'axios';
import {
  // AuthHyperledgerResponse,
  HyperledgerQueryResponse,
  HyperledgerResponse,
  StatusResponse,
  SubscribeResponse,
  SubscriptionCountResponse,
} from 'core';
import Mock from 'jest-mock-extended/lib/Mock';
import { of, throwError } from 'rxjs';
import { ApplicationException } from './application-exception';
import { HyperledgerClientService } from './hyperledger-client.service';

describe('HyperledgerClientService', () => {
  let service: HyperledgerClientService;
  let httpService;

  const mockHttpService = () => ({
    get: jest.fn(),
    post: jest.fn(),
  });

  const mockConfig = {
    get: jest.fn((key: string) => {
      // this is being super extra, in the case that you need multiple keys with the `get` method
      if (key === 'HYPERLEDGER_URL') {
        return 'http://mockhyperledger:4050';
      }
      if (key === 'HYPERLEDGER_CLIENT_ID') {
        return mockClientId;
      }
      return null;
    }),
  };

  const mockAxiosError = Mock<AxiosError>();

  const mockClientId = '12345';

  let mockHyperLedgerResponse: HyperledgerResponse;
  let mockSubCountResponse: SubscriptionCountResponse;
  let mockQueryResponse: HyperledgerQueryResponse;
  let mockSubResponse: SubscribeResponse;
  let mockStatusResponse: StatusResponse;
  beforeEach(async () => {
    mockHyperLedgerResponse = {
      message: { response: 'ok', txnId: '1234123' },
      error: '',
    };

    mockSubCountResponse = {
      error: '',
      message: [
        {
          chaincodeName: 'hello',
          channelName: 'hello',
          eventCategory: 'cat',
          subscriptionIds: ['12314'],
        },
      ],
    };

    mockQueryResponse = {
      error: '',
      message: {
        data: 'lots of data',
        response: 'hello',
      },
    };

    mockSubResponse = {
      message: {
        subscriptionId: '12345',
      },
      error: '',
    };

    mockStatusResponse = {
      message: 'status',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HyperledgerClientService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: HttpService, useFactory: mockHttpService },
      ],
    }).compile();

    service = module.get<HyperledgerClientService>(HyperledgerClientService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should invoke submit order', async () => {
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    const result = await service.invokeSubmitOrder('');
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
    expect(result).toEqual(mockHyperLedgerResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockHyperLedgerResponse.error = 'error';
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeSubmitOrder('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockPostResponse = throwError(() => mockAxiosError);
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeSubmitOrder('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should invoke update transport info', async () => {
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    const result = await service.invokeUpdateTransportInfo('');
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
    expect(result).toEqual(mockHyperLedgerResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockHyperLedgerResponse.error = 'error';
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeUpdateTransportInfo('')).rejects.toThrow();
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockPostResponse = throwError(() => mockAxiosError);
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeUpdateTransportInfo('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should invoke initiate declaration', async () => {
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    const result = await service.invokeInitiateDeclaration('');
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
    expect(result).toEqual(mockHyperLedgerResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockHyperLedgerResponse.error = 'error';
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeInitiateDeclaration('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockPostResponse = throwError(() => mockAxiosError);
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeInitiateDeclaration('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should invoke deliver order', async () => {
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    const result = await service.invokeDeliverOrder('');
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
    expect(result).toEqual(mockHyperLedgerResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockHyperLedgerResponse.error = 'error';
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeDeliverOrder('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockPostResponse = throwError(() => mockAxiosError);
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeDeliverOrder('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should invoke confirm return delivery', async () => {
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    const result = await service.invokeConfirmReturnDelivery('');
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
    expect(result).toEqual(mockHyperLedgerResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockHyperLedgerResponse.error = 'error';
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeConfirmReturnDelivery('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockPostResponse = throwError(() => mockAxiosError);
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.invokeConfirmReturnDelivery('')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should subscribe to events', async () => {
    const mockPostResponse = of({
      data: mockSubResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    const result = await service.subscribeToEvents('mockurl', 2, 'Block', '');
    expect(httpService.post).toBeCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
    expect(result).toEqual(mockSubResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockSubResponse.error = 'error';
    const mockPostResponse = of({
      data: mockSubResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(
      service.subscribeToEvents('mockurl', 2, 'Block', ''),
    ).rejects.toThrow(ApplicationException);
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockPostResponse = throwError(() => mockAxiosError);
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(
      service.subscribeToEvents('mockurl', 2, 'Block', ''),
    ).rejects.toThrow(ApplicationException);
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should unsubscribe to events', async () => {
    const mockPostResponse = of({
      data: mockSubResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    const result = await service.unsubscribeToEvents('id');
    expect(httpService.post).toBeCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
    expect(result).toEqual(mockSubResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockHyperLedgerResponse.error = 'error';
    const mockPostResponse = of({
      data: mockHyperLedgerResponse,
    });
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.unsubscribeToEvents('id')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockPostResponse = throwError(() => mockAxiosError);
    httpService.post.mockReturnValue(mockPostResponse);
    await expect(service.unsubscribeToEvents('id')).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.post).toBeCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should get subscribe count', async () => {
    const mockGetResponse = of({
      data: mockSubCountResponse,
    });
    httpService.get.mockReturnValue(mockGetResponse);
    const result = await service.getCurrentSubscriptions();
    expect(httpService.get).toBeCalled();
    expect(result).toEqual(mockSubCountResponse);
  });

  it('should throw an error if value of error prop is not empty', async () => {
    mockSubCountResponse.error = 'error';
    const mockGetResponse = of({
      data: mockSubCountResponse,
    });
    httpService.get.mockReturnValue(mockGetResponse);
    await expect(service.getCurrentSubscriptions()).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.get).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(6);
  });

  it('should throw an error if hyperledger throws error', async () => {
    const mockGetResponse = throwError(() => mockAxiosError);
    httpService.get.mockReturnValue(mockGetResponse);
    await expect(service.getCurrentSubscriptions()).rejects.toThrow(
      ApplicationException,
    );
    expect(httpService.get).toHaveBeenCalled();
    expect(mockConfig.get).toBeCalledTimes(5);
  });

  it('should ping hl', async () => {
    const mockGetResponse = of({
      data: mockStatusResponse,
    });
    httpService.get.mockReturnValue(mockGetResponse);
    const result = await service.ping();
    expect(httpService.get).toBeCalled();
    expect(result).toEqual(mockStatusResponse);
  });

  it('query order data', async () => {
    const mockGetResponse = of({
      data: mockQueryResponse,
    });
    httpService.post.mockReturnValue(mockGetResponse);
    const result = await service.queryOrderData(
      'GetDataByKey',
      'collect',
      'key',
    );
    expect(httpService.post).toBeCalled();
    expect(result).toEqual(mockQueryResponse);
  });
});
