import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfirmReturnDeliveryParameters,
  DeliverOrderParameters,
  HyperledgerResponse,
  InitiateDeclarationParameters,
  ReturnOrder,
  StartingBlockQuery,
  StatusResponse,
  SubmitOrder,
  SubmitOrderParameters,
  SubmitOrderParametersForReturn,
  SubscribeResponse,
  UpdateExitConfirmationParameters,
  UpdateTransportInfoParameters,
} from 'core';
import { HyperledgerEventNames } from 'hyperledger/constants/hyperledger-events';
import { HyperledgerEventsService } from '../database/hyperledger-events.service';
import { DataTransformerService } from '../dataTransformer/data-transformer.service';
import { ConfirmReturnDeliveryDatagenParametersDto } from '../dto/confirmReturnDeliveryDatagenParameters.dto';
import { DeliverOrderDatagenParametersDto } from '../dto/deliverOrderDatagenParameters.dto';
import { InitiateDeclarationDatagenParametersDto } from '../dto/initiateDeclarationDatagenParameters.dto';
import { UpdateExitConfirmationDatagenParametersDto } from '../dto/updateExitConfirmationDatagenParameters.dto';
import { UpdateTransportInfoDatagenParametersDto } from '../dto/updateTransportInfoDatagenParameters.dto';
import { HyperledgerClientService } from '../hyperledger/hyperledger-client/hyperledger-client.service';

@Injectable()
export class ServicelayerService {
  private readonly logger = new Logger(HyperledgerClientService.name);

  constructor(
    private readonly hlClientService: HyperledgerClientService,
    private readonly hlEventService: HyperledgerEventsService,
    private configService: ConfigService,
    private dataTransformer: DataTransformerService,
  ) {}

  private activeSubscriptions = {};
  private callbackURL = () =>
    `${this.configService.get('DATAGEN_PUBLIC_URL')}/hl-events/contract`;
  private configuredStartingBlock = () =>
    this.configService.get<number>('STARTING_BLOCK') ?? 0;

  async invokeHLSubmitOrder(
    request: SubmitOrder,
  ): Promise<HyperledgerResponse> {
    const signedPayload = await this.dataTransformer.transformSubmitOrder(
      request,
    );
    const transientValue =
      this.createTransientValuesWithPipesForSubmitOrder(signedPayload);
    const resp = await this.hlClientService.invokeSubmitOrder(transientValue);
    this.logger.debug(
      `response from invoke SubmitOrder ${JSON.stringify(resp)}`,
    );
    if (resp.error && resp.error !== '') {
      this.logger.error(
        'Error on invokeSubmitOrder. Response: ' + JSON.stringify(resp),
      );
      throw new Error(resp.error);
    }
    await this.hlEventService.createTxnLookup({
      txnId: resp.message.txnId,
      orderNumber: request.orderNumber,
      eventType: 'invokeSubmitOrder',
      ecomCode: request.ecomBusinessCode,
    });
    return resp;
  }

  async invokeHLReturnOrder(
    request: ReturnOrder,
  ): Promise<HyperledgerResponse> {
    const signedPayload =
      await this.dataTransformer.transformSubmitOrderForReturn(request);
    const transientValue =
      this.createTransientValuesWithPipesForSubmitOrder(signedPayload);
    const resp = await this.hlClientService.invokeSubmitOrder(transientValue);
    this.logger.debug(
      `response from invoke SubmitOrder ${JSON.stringify(resp)}`,
    );
    try {
      await this.hlEventService.createTxnLookup({
        txnId: resp.message.txnId,
        orderNumber: request.orderNumber,
        eventType: 'invokeSubmitOrder',
        ecomCode: request.ecomBusinessCode,
      });
    } catch (error) {
      this.logger.error(error);
    }
    return resp;
  }

  public async invokeHLUpdateTransportInfo(
    request: UpdateTransportInfoDatagenParametersDto,
  ): Promise<HyperledgerResponse> {
    let signedPayload: UpdateTransportInfoParameters;
    if (request.returnRequest) {
      const { returnRequest, ...orderAggregate } = request;
      signedPayload =
        await this.dataTransformer.transformUpdateTransportInfoReturn(
          orderAggregate,
          returnRequest,
        );
    } else {
      signedPayload = await this.dataTransformer.transformUpdateTransportInfo(
        request,
      );
    }
    const transientValue = this.createTransientValuesWithPipes(signedPayload);
    const resp = await this.hlClientService.invokeUpdateTransportInfo(
      transientValue,
    );
    await this.hlEventService.createTxnLookup({
      txnId: resp.message.txnId,
      orderNumber: request.order.orderNumber,
      eventType: 'invokeHLUpdateTransportInfo',
      ecomCode: request.order.ecomBusinessCode,
    });
    return resp;
  }

  public async invokeHLInitiateDeclaration(
    request: InitiateDeclarationDatagenParametersDto,
  ): Promise<HyperledgerResponse> {
    const { invoiceNumber, ...orderAggregate } = request;
    const signedPayload =
      await this.dataTransformer.transformInitiateDeclaration(
        orderAggregate,
        invoiceNumber,
      );
    const transientValue = this.createTransientValuesWithPipes(signedPayload);
    const resp = await this.hlClientService.invokeInitiateDeclaration(
      transientValue,
    );

    await this.hlEventService.createTxnLookup({
      txnId: resp.message.txnId,
      orderNumber: request.order.orderNumber,
      invoiceNumber: invoiceNumber,
      eventType: 'invokeHLInitiateDeclaration',
      ecomCode: request.order.ecomBusinessCode,
    });
    return resp;
  }

  public async invokeHLDeliverOrder(
    request: DeliverOrderDatagenParametersDto,
  ): Promise<HyperledgerResponse> {
    const { returnRequest, ...orderAggregate } = request;
    let signedPayload;
    if (returnRequest) {
      signedPayload = await this.dataTransformer.transformReturnDeliverOrder(
        orderAggregate,
        returnRequest,
      );
    } else {
      signedPayload = await this.dataTransformer.transformDeliverOrder(
        orderAggregate,
      );
    }
    const transientValue = this.createTransientValuesWithPipes(signedPayload);
    const resp = await this.hlClientService.invokeDeliverOrder(transientValue);
    await this.hlEventService.createTxnLookup({
      txnId: resp.message.txnId,
      orderNumber: request.order.orderNumber,
      invoiceNumber: signedPayload.invoiceNumber,
      eventType: 'invokeHLDeliverOrder',
      ecomCode: request.order.ecomBusinessCode,
    });
    return resp;
  }

  public async invokeHLConfirmReturnDelivery(
    request: ConfirmReturnDeliveryDatagenParametersDto,
  ): Promise<HyperledgerResponse> {
    const { confirmReturnDelivery, ...orderAggregate } = request;
    const signedPayload =
      await this.dataTransformer.transformConfirmReturnDelivery(
        orderAggregate,
        confirmReturnDelivery,
      );
    const transientValue = this.createTransientValuesWithPipes(signedPayload);
    const resp = await this.hlClientService.invokeConfirmReturnDelivery(
      transientValue,
    );
    await this.hlEventService.createTxnLookup({
      txnId: resp.message.txnId,
      orderNumber: request.order.orderNumber,
      eventType: 'confirmReturnDelivery',
      ecomCode: request.order.ecomBusinessCode,
    });
    return resp;
  }

  public async invokeHLUpdateExitConfirmation(
    request: UpdateExitConfirmationDatagenParametersDto,
  ): Promise<HyperledgerResponse> {
    const { declarationNumber, ...orderAggregate } = request;
    const signedPayload =
      await this.dataTransformer.transformUpdateExitConfirmation(
        orderAggregate,
        declarationNumber,
      );
    const transientValue = this.createTransientValuesWithPipes(signedPayload);
    const resp = await this.hlClientService.invokeUpdateExitConfirmation(
      transientValue,
    );
    await this.hlEventService.createTxnLookup({
      txnId: resp.message.txnId,
      orderNumber: request.order.orderNumber,
      eventType: 'updateExitConfirmation',
      ecomCode: request.order.ecomBusinessCode,
    });
    return resp;
  }

  public pingHL(): Promise<StatusResponse> {
    return this.hlClientService.ping();
  }

  public async checkHLSubscriptions(): Promise<void> {
    const hlSubs = (await this.hlClientService.getCurrentSubscriptions())
      .message;
    const hlSubIds: string[] = [];
    hlSubs.forEach((hlSub) => {
      hlSubIds.push(...hlSub.subscriptionIds);
    });

    this.logger.debug('HLSubscriptions: ' + JSON.stringify(hlSubs));
    this.logger.debug(
      'Local subscriptions: ' + JSON.stringify(this.activeSubscriptions),
    );
    this.logger.debug('(These ids should match, mismatch causes resubscribe)');

    try {
      if (hlSubIds.length !== Object.keys(this.activeSubscriptions).length) {
        this.logger.debug(
          'Mismatch between HL and Local subscriptions, resolving...',
        );

        const startingBlocks = await this.hlEventService.findStartingBlock();
        this.logger.debug(
          `result of second highest block query ${JSON.stringify(
            startingBlocks,
          )}`,
        );

        for (const activeSubId of Object.keys(this.activeSubscriptions)) {
          if (hlSubIds.includes(activeSubId)) continue; //skip subscription

          this.logger.debug(
            'Resubscribing to: ' +
              JSON.stringify(this.activeSubscriptions[activeSubId]),
          );
          this.logger.debug(JSON.stringify(this.activeSubscriptions));
          const knownBlock = startingBlocks.find(
            (x) =>
              x.eventName === this.activeSubscriptions[activeSubId].eventName,
          );

          // Update subscriptions on HL
          const newSubId = await this.hlClientService.subscribeToEvents(
            this.callbackURL(),
            this.DetermineStartingBlock(knownBlock),
            this.activeSubscriptions[activeSubId].eventCategory,
            this.activeSubscriptions[activeSubId].eventName,
          );

          // Update local activeSubscriptions
          this.activeSubscriptions[newSubId.message.subscriptionId] = {
            eventCategory: this.activeSubscriptions[activeSubId].eventCategory,
            eventName: this.activeSubscriptions[activeSubId].eventName,
          };
          delete this.activeSubscriptions[activeSubId];
        }
      }
    } catch (error) {
      this.logger.error(
        'Something went wrong when re-establishing subscriptions: ' + error,
      );
      this.logger.error('Trying again after a delay');
    }
  }

  public async unsubscribeFromAllCurrentEvents(): Promise<void> {
    const subs = (await this.hlClientService.getCurrentSubscriptions()).message;
    const subIds: string[] = Array.prototype.concat(
      ...subs.map((sub) => sub.subscriptionIds),
    );

    const promises = subIds.map((subId) => {
      return this.hlClientService.unsubscribeToEvents(subId);
    });
    await Promise.all(promises);
    this.activeSubscriptions = {};
  }

  public async initialiseSubscriptions(): Promise<void> {
    this.activeSubscriptions = {};
    await this.unsubscribeFromAllCurrentEvents();
    this.logger.log(`Sending callback url to the hyperledger...`);

    const eventNames = [
      HyperledgerEventNames.declaration,
      HyperledgerEventNames.claim,
      HyperledgerEventNames.chain,
    ];
    const startingBlocks = await this.hlEventService.findStartingBlock();
    this.logger.debug(
      `result of second highest block query ${JSON.stringify(startingBlocks)}`,
    );
    const promisesToAwait: Promise<SubscribeResponse>[] = [];

    for (const eventName of eventNames) {
      const knownBlock = startingBlocks.find((x) => x.eventName === eventName);
      promisesToAwait.push(
        this.hlClientService.subscribeToEvents(
          this.callbackURL(),
          this.DetermineStartingBlock(knownBlock),
          'Contract',
          eventName,
        ),
      );
    }
    const subResponses = await Promise.all(promisesToAwait);
    for (let i = 0; i < subResponses.length; i++) {
      this.activeSubscriptions[subResponses[i].message.subscriptionId] = {
        eventCategory: 'Contract',
        eventName: eventNames[i],
      };
    }
  }

  public async pingAndResubscribeIfUp(): Promise<void> {
    await this.pingHL();
    await this.initialiseSubscriptions();
  }

  public createTransientValuesWithPipesForSubmitOrder(
    req: SubmitOrderParameters | SubmitOrderParametersForReturn,
  ): string {
    let transientValue = '';
    const toSend = {
      ...req,
    };

    Object.values(toSend).forEach((val) => {
      if (typeof val === 'object' && val !== null)
        transientValue = transientValue.concat(`${JSON.stringify(val)}|`);
      else transientValue = transientValue.concat(`${val}|`);
    });
    return transientValue.slice(0, -1);
  }

  //Create pipe seperated string of values
  public createTransientValuesWithPipes(
    req:
      | DeliverOrderParameters
      | InitiateDeclarationParameters
      | UpdateTransportInfoParameters
      | ConfirmReturnDeliveryParameters
      | UpdateExitConfirmationParameters,
  ): string {
    let transientValue = '';
    Object.values(req).forEach((val) => {
      if (typeof val === 'object' && val !== null)
        transientValue = transientValue.concat(`${JSON.stringify(val)}|`);
      else transientValue = transientValue.concat(`${val}|`);
    });
    return transientValue.slice(0, -1);
  }

  private DetermineStartingBlock(knownBlock?: StartingBlockQuery): number {
    let startingBlock = 0;
    if (knownBlock) {
      startingBlock = knownBlock.highestBlockNumber;
    }
    const result = Math.max(startingBlock, this.configuredStartingBlock());
    this.logger.log(`highest block ${result}`);
    return result;
  }
}
