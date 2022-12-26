import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CheckPointFile, DeliveredView, Direction, Order } from 'core';
import { mockDeep } from 'jest-mock-extended';
import Mock from 'jest-mock-extended/lib/Mock';
import { BlessClientService } from '../bless/bless-client/bless-client.service';
import { UpdateTransportInfoDatagenParametersDto } from '../dto/updateTransportInfoDatagenParameters.dto';
import { SecretsService } from '../secrets/secrets.service';
import { DataTransformerService } from './data-transformer.service';
import { mockSubmitOrder } from './mocks.models';

const mockOrder = mockSubmitOrder;

describe('DataTransformer', () => {
  let dataTransformer: DataTransformerService;
  let secretsService;
  let configService;
  const privateKey =
    '-----BEGIN RSA PRIVATE KEY-----\nMIICWwIBAAKBgQDD7eZUIfsi9iFxM8iXDYQMoybqA0leNzWGftpExaW/7yhEv7CA\nHxW64p9DDYzzuhmykZTAsC+Q/1+iRNPba9Pzvq+Xz0Om1W3hbN89Qn83ZcJ6wCei\nw4GK3Z8AHDTjwBFBWkQxzZ7de3MqDDyeGRUfXZtLcfqx40StqaMW7SVqBQIDAQAB\nAoGAEJz6e8XJ2qQOH+ApMQ23Va773Lncnb2Gr1nQPiaYMFciDfpHCAYavJb8tB3R\nBtWP2kFX4KLP1bahsEuvvxo8hXdPdcWz/YaQIteygSLK1b4cCWz+efhkt4gol8LT\nsdbMirw9KQEA84UpuRyW/Pk2obJEqWlEVZsnmgJBhVbmDz0CQQD12SgRRNZWnDMd\nUlUkRzX8z1VoVZUi8C36EHAugZQOk/I1IgWLDGXjRbIju1iEKxXEnVC1DQBUe8/z\n12szTcSLAkEAzAUNs6/jriWBilE10jU3fxKV7o9BmRK5rPXlgOmv3FCw0cFTpAIQ\n24SSA641T3Y6BQ0awjEknPbJ0LiSOyMNrwJAQdyELGQpm5hK5T8KSia9otWUhtfu\nlSaM2qIOu5bBKEqgJ3XO0Fpo7ULdn07wPrAgK8UNOwOZpAhrRGLgeCUMUwJAStWj\ntABVbGBXhsvJCST6CUNg+ZNUhXhn4PiFSWbuWcrDQP0/183mLw8OnAj/hvkfyRCI\neyiZfHXNiyDYipaOAwJABU1yIeVp5rqM1DKAA5e7Z4Mx7d1IZ7+gIewHHTpah+iK\nCddHYmu51axBMhkOdDrV4oUUVAYTdj2kIktpsaLmXA==\n-----END RSA PRIVATE KEY-----';

  const mockSecretsService = () => ({
    getSecretsFromMemory: jest.fn(() => ({
      dhl: privateKey,
      shared: privateKey,
      [mockSubmitOrder.ecomBusinessCode]: privateKey,
    })),
    getSecretsHashiCorp: jest.fn(),
    ecomPartySecret: jest.fn(),
  });

  const mockConfigService = () => ({
    get: jest.fn((key: string) => {
      // this is being super extra, in the case that you need multiple keys with the `get` method
      if (key === 'HASHICORP_DHL_CODE_LOOKUP') {
        return 'dhl';
      }
      if (key === 'HASHICORP_SHARED_KEY_LOOKUP') {
        return 'shared';
      }
      return null;
    }),
  });

  const mockBlessClientService = () => ({
    post: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: SecretsService, useFactory: mockSecretsService },
        { provide: BlessClientService, useFactory: mockBlessClientService },
        DataTransformerService,
      ],
    }).compile();
    module.useLogger(Mock<Logger>());

    dataTransformer = module.get<DataTransformerService>(
      DataTransformerService,
    );
    secretsService = module.get<SecretsService>(SecretsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('transformSubmitOrder', () => {
    it('should correctly transform to SubmitOrderParameters', async () => {
      const t = await dataTransformer.transformSubmitOrder(mockOrder);
      expect(t.orgCode).toEqual('testLogisticsSPBusinessCode');
    });

    it('should correctly transform dates to Dubai dates', async () => {
      mockOrder.orderDate = '2021-08-13T09:26:55+0000';
      mockOrder.invoices[0].invoiceDate = '2021-08-13T09:26:55+0000';
      const t = await dataTransformer.transformSubmitOrder(mockOrder);
      expect(mockOrder.orderDate).not.toEqual(t.orderDate);
      expect(t.orderDate).toEqual('13/08/2021 13:26:55');
      expect(mockOrder.invoices[0].invoiceDate).not.toEqual(
        t.invoices[0].invoiceDate,
      );
      expect(t.invoices[0].invoiceDate).toEqual('2021-08-13');
    });
    it('should produce an object with a signature', async () => {
      const t = await dataTransformer.transformSubmitOrder(mockOrder);
      expect(configService.get).toBeCalledTimes(1);
      expect(secretsService.getSecretsFromMemory).toBeCalledTimes(1);
      expect(t.signature).not.toBeNull();
    });
  });

  describe('UpdateTransportInfoParameters', () => {
    it('should be correctly transform to UpdateTransportInfoParameters', async () => {
      const mockOrderAggregate: UpdateTransportInfoDatagenParametersDto =
        mockDeep<UpdateTransportInfoDatagenParametersDto>();
      mockOrderAggregate.movementData.shippingDetails.portOfLoad = 'SDV';
      const t = await dataTransformer.transformUpdateTransportInfo(
        mockOrderAggregate,
      );
      expect(t.mode).toEqual(mockOrderAggregate.order.mode);
      expect(t.shippingDetail.portOfLoad).toEqual('IL');
    });
    it('should be correctly transform to UpdateTransportInfoParameters for loadport = "DXH"', async () => {
      const mockOrderAggregate: UpdateTransportInfoDatagenParametersDto =
        mockDeep<UpdateTransportInfoDatagenParametersDto>();
      mockOrderAggregate.movementData.shippingDetails.portOfLoad = 'DXH';
      const t = await dataTransformer.transformUpdateTransportInfo(
        mockOrderAggregate,
      );
      expect(t.mode).toEqual(mockOrderAggregate.order.mode);
      expect(t.shippingDetail.portOfLoad).toEqual('D04');
    });

    it('should produce an object with a signature', async () => {
      const mockOrderAggregate: UpdateTransportInfoDatagenParametersDto =
        mockDeep<UpdateTransportInfoDatagenParametersDto>();
      mockOrderAggregate.movementData.shippingDetails.portOfLoad = 'DXH';
      const t = await dataTransformer.transformUpdateTransportInfo(
        mockOrderAggregate,
      );
      expect(configService.get).toBeCalledTimes(2);
      expect(secretsService.getSecretsFromMemory).toBeCalledTimes(1);
      expect(t.signature).not.toBeNull();
    });
  });

  describe('transformInitiateDeclaration', () => {
    it('should throw when missing invoice when transforming to InitiateDeclarationParameters', () => {
      const mockOrderAggregate: {
        order: Order;
        direction: Direction;
      } = mockDeep<{
        order: Order;
        direction: Direction;
      }>();
      expect(
        dataTransformer.transformInitiateDeclaration(
          mockOrderAggregate,
          'testInvId',
        ),
      ).rejects.toThrow();
    });

    it('should be correctly transform to InitiateDeclarationParameters', async () => {
      const mockOrderAggregate: {
        order: Order;
        direction: Direction;
      } = mockDeep<{
        order: Order;
        direction: Direction;
      }>();
      mockOrderAggregate.order = mockSubmitOrder;
      const invoiceId = mockSubmitOrder.invoices[0].invoiceNumber;
      const t = await dataTransformer.transformInitiateDeclaration(
        mockOrderAggregate,
        invoiceId,
      );
      expect(t.invoiceNumber).toEqual(invoiceId);
    });

    it('should produce an object with a signature', async () => {
      const mockOrderAggregate: {
        order: Order;
        direction: Direction;
      } = mockDeep<{
        order: Order;
        direction: Direction;
      }>();
      mockOrderAggregate.order = mockSubmitOrder;
      const invoiceId = mockSubmitOrder.invoices[0].invoiceNumber;
      const t = await dataTransformer.transformInitiateDeclaration(
        mockOrderAggregate,
        invoiceId,
      );
      expect(configService.get).toBeCalledTimes(2);
      expect(secretsService.getSecretsFromMemory).toBeCalledTimes(1);
      expect(t.signature).not.toBeNull();
    });
  });

  describe('getUTCTimeStamp', () => {
    it('should get utc time zone', () => {
      const result = dataTransformer.getUtcTimeStamp('12/11/2021 12:00:00Z');
      const expected = '1639224000000';
      expect(result).toBe(expected);
    });
  });

  describe('transformDeliverOrder', () => {
    it('should get time specific format for delivery order', async () => {
      const mockOrderAggregate: {
        order: Order;
        delivered: DeliveredView[];
        direction: Direction;
        pickupFile: CheckPointFile;
      } = mockDeep<{
        order: Order;
        delivered: DeliveredView[];
        direction: Direction;
        pickupFile: CheckPointFile;
      }>();
      mockOrderAggregate.pickupFile = {
        eventCode: 'PU',
        eventRemark: 'SHIPMENT PICKUP',
        eventDate: '2021-11-12 17:05:33',
        eventGMT: '+04:00',
        weight: 0.65,
        volumeWeight: 1.2,
        weightQualifier: 'kg',
        shipperReference: 'Test123',
        hawb: 'testhawb',
        destination: 'MEL',
        origin: 'DXB',
        shipmentDeclaredValue: '1092.00',
        shipmentCurrency: 'AED',
        ecomBusinessCode: 'AE-8122637',
        ETADateTime: '2021-11-12 23:59:00',
        numberOfPackages: 1,
      };
      mockOrderAggregate.delivered = [
        {
          airwayBillNumber: 'testhawb',
          transportDocumentNumber: 'doc1',
          type: '1',
          deliveryDate: '2021-11-12 17:05:33',
          deliveryStatus: '1',
          signature: 'sign',
          deliverTo: 'Jason',
          deliveryType: '1',
          returnTo: 'Isma',
          documents: 'docs', // not sure what value
          deliveryCode: 'OK',
          origin: 'testOrigin',
          destination: 'testDestination',
        },
      ];

      const result = await dataTransformer.transformDeliverOrder(
        mockOrderAggregate,
      );
      const expected = '2021-11-12'; //YYYY-MM-DD
      expect(result.deliveryDate).toBe(expected);
    });

    it('should get deliverStatus value 1 in case deliveryCode is OK', async () => {
      const mockOrderAggregate: {
        order: Order;
        delivered: DeliveredView[];
        direction: Direction;
        pickupFile: CheckPointFile;
      } = mockDeep<{
        order: Order;
        delivered: DeliveredView[];
        direction: Direction;
        pickupFile: CheckPointFile;
      }>();
      mockOrderAggregate.pickupFile = {
        eventCode: 'PU',
        eventRemark: 'SHIPMENT PICKUP',
        eventDate: '2021-11-12 17:05:33',
        eventGMT: '+04:00',
        weight: 0.65,
        volumeWeight: 1.2,
        weightQualifier: 'kg',
        shipperReference: 'Test123',
        hawb: 'testhawb',
        destination: 'MEL',
        origin: 'DXB',
        shipmentDeclaredValue: '1092.00',
        shipmentCurrency: 'AED',
        ecomBusinessCode: 'AE-8122637',
        ETADateTime: '2021-11-12 23:59:00',
        numberOfPackages: 2,
      };
      mockOrderAggregate.delivered = [
        {
          airwayBillNumber: 'testhawb',
          transportDocumentNumber: 'doc1',
          type: '1',
          deliveryDate: '2021-11-12 17:05:33',
          deliveryStatus: '1',
          signature: 'sign',
          deliverTo: 'Jason',
          deliveryType: '1',
          returnTo: 'Isma',
          documents: 'docs', // not sure what value
          deliveryCode: 'OK',
          origin: 'testOrigin',
          destination: 'testDestination',
        },
      ];

      const result = await dataTransformer.transformDeliverOrder(
        mockOrderAggregate,
      );
      const expected = '1'; //OK - 1 else - 2
      expect(result.deliveryStatus).toBe(expected);
    });

    it('should produce an object with a signature', async () => {
      const mockOrderAggregate: {
        order: Order;
        delivered: DeliveredView[];
        direction: Direction;
        pickupFile: CheckPointFile;
      } = mockDeep<{
        order: Order;
        delivered: DeliveredView[];
        direction: Direction;
        pickupFile: CheckPointFile;
      }>();
      const t = await await dataTransformer.transformDeliverOrder(
        mockOrderAggregate,
      );
      expect(configService.get).toBeCalledTimes(2);
      expect(secretsService.getSecretsFromMemory).toBeCalledTimes(1);
      expect(t.signature).not.toBeNull();
    });
  });

  it('should not crash', () => {
    dataTransformer.getUtcTimeStamp();
  });
});
