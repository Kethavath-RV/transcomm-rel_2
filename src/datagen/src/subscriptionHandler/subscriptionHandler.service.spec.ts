import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { ServicelayerService } from '../servicelayer/servicelayer.service';
import { SubscriptionHandlerService } from './subscriptionHandler.service';

describe('SubscriptionHandlerService', () => {
  let subscriptionHandlerService: SubscriptionHandlerService;
  let servicelayerService: ServicelayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionHandlerService,
        { provide: ServicelayerService, useValue: mock<ServicelayerService>() },
      ],
    })
      .setLogger(mock<Logger>())
      .compile();

    subscriptionHandlerService = module.get<SubscriptionHandlerService>(
      SubscriptionHandlerService,
    );
    servicelayerService = module.get<ServicelayerService>(ServicelayerService);
  });

  it('should be defined"', () => {
    expect(subscriptionHandlerService).toBeDefined();
  });

  it('should initialise subscriptions"', () => {
    jest
      .spyOn(servicelayerService, 'initialiseSubscriptions')
      .mockResolvedValue();

    subscriptionHandlerService.createSubscriptions();
    expect(servicelayerService.initialiseSubscriptions).toBeCalledTimes(1);
  });

  it('should unsubscribe from subscriptions on module destroy"', () => {
    jest
      .spyOn(servicelayerService, 'unsubscribeFromAllCurrentEvents')
      .mockResolvedValue();

    subscriptionHandlerService.onModuleDestroy();
    expect(servicelayerService.unsubscribeFromAllCurrentEvents).toBeCalledTimes(
      1,
    );
  });
});
