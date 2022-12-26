import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Payload } from '@nestjs/microservices';
import { CreateAirwayBillToOrderIdLookupCommand } from 'aggregates/airwayNumToOrderIdLookup/commands/impl/create-airwaybillno-orderid-lookup';
import { PerformAirwayBillNoToOrderIdLookupMovementCommand } from 'aggregates/airwayNumToOrderIdLookup/commands/impl/perform-lookup-movement';
import { CreateMawbToAirwaynumsLookupCommand } from 'aggregates/mawbAirwayNumsLookup/commands/impl/create-mawb-airwaynums-lookup';
import { PerformMawbAirwayNumsLookupCommand } from 'aggregates/mawbAirwayNumsLookup/commands/impl/perform-mawb-lookup';
import { CancelOrderCommand } from 'aggregates/orders/commands/impl/cancel-order';
import { ConfirmReturnDeliveryMessageReceivedCommand } from 'aggregates/orders/commands/impl/confirm-return-delivery-message';
import { CreateOrderCommand } from 'aggregates/orders/commands/impl/create-order';
import { ProcessDeliveredCommand } from 'aggregates/orders/commands/impl/process-delivered';
import { ProcessHyperledgerEventCommand } from 'aggregates/orders/commands/impl/process-hl-event';
import { ProcessOtherCheckpointFileCommand } from 'aggregates/orders/commands/impl/process-other-checkpointfile';
import { ProcessPickupFileCommand } from 'aggregates/orders/commands/impl/process-pickupfile';
import { ProcessUndeliveredCommand } from 'aggregates/orders/commands/impl/process-undelivered';
import { SubmitReturnOrderCommand } from 'aggregates/orders/commands/impl/return-order';
import { UpdateOrderCommand } from 'aggregates/orders/commands/impl/update-order';
import { OrderAggregateKey } from 'aggregates/orders/order-aggregate-key';
import { CreateVcIdLookupCommand } from 'aggregates/vcIdLookups/commands/impl/create-vcId-lookup';
import { PerformVcIdLookupCommand } from 'aggregates/vcIdLookups/commands/impl/perform-lookup';
import {
  CancelOrder,
  CheckPointFile,
  ConfirmReturnDelivery,
  DetailMovement,
  DHLEDeclarationRequest,
  LookupType,
  MasterMovement,
  ModeType,
  NotificationType,
  ReturnOrder,
  SubmitOrder,
} from 'core';
import { recursiveSearch } from 'kafka/common/helpers';
import { SubscribeTo } from 'kafka/common/kafka.decorator';
import { KafkaService } from 'kafka/common/kafka.service';
import { BusinessMessageModelDto } from 'kafka/common/validation/businessMessageModelSchema';
import { NotificationMessageModelDto } from 'kafka/common/validation/notificationMessageModelSchema';
import { PickupMovementsMessageModelDto } from 'kafka/common/validation/pickupMovementMessageModelDto';
import { ProducerService } from 'kafka/producer/producer.service';
import { IHeaders } from 'kafkajs';
import { PerformAirwayBillNoToOrderIdLookupDHLECommand } from '../../aggregates/airwayNumToOrderIdLookup/commands/impl/perform-lookup-dhle';
import { ProcessDfCheckpointFileCommand } from '../../aggregates/orders/commands/impl/process-df-checkpointfile';
import { isOfMessageType } from '../../helpers/isOfMessageType';

const customsTopic = process.env.KAFKA_TOPIC_CUSTOMS || '';
const pickupMovementsTopic = process.env.KAFKA_TOPIC_PICKUPS_MOVEMENTS || '';
const blessAckTopic = process.env.KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT || '';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);

  constructor(
    @Inject('Kafka_service') private client: KafkaService,
    private kafkaProducerService: ProducerService,
    private readonly commandBus: CommandBus,
    private configService: ConfigService,
  ) {}

  onModuleInit(): void {
    if (!blessAckTopic || !pickupMovementsTopic || !customsTopic) {
      throw new Error(
        'Make sure KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT, KAFKA_TOPIC_PICKUPS_MOVEMENTS, KAFKA_TOPIC_CUSTOMS are set in the environment variables',
      );
    }
    this.client.subscribeToResponseOf(customsTopic, this);
    this.client.subscribeToResponseOf(pickupMovementsTopic, this);
  }

  @SubscribeTo(customsTopic)
  async incomingCustomsMessage(
    @Payload() message: NotificationMessageModelDto | BusinessMessageModelDto,
    _headers: IHeaders,
    _key: string,
    timestamp: string,
  ): Promise<void> {
    this.logger.log(
      'incoming kafka to topic: ' +
        customsTopic +
        ' - at timestamp: ' +
        timestamp,
    );
    if (message instanceof BusinessMessageModelDto) {
      this.logger.debug(`Incoming BusinessMessage: ${JSON.stringify(message)}`);
      switch (true) {
        case isOfMessageType(
          this.configService.get('BLESS_NEW_ORDER_MESSAGE_TYPE'),
          message.msgType,
        ):
          await this.parseOrderMessage(message);
          break;
        case isOfMessageType(
          this.configService.get('BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE'),
          message.msgType,
        ):
          await this.parseConfirmReturn(message);
          break;
        case isOfMessageType(
          this.configService.get('DATAGEN_KAFKA_EXCEPTION_MESSAGE_TYPE'),
          message.msgType,
        ):
          await this.parseExceptionMessage(message);
          break;
        case isOfMessageType(
          this.configService.get(
            'BLESS_DECLARATION_REQUEST_EXPORT_MESSAGE_TYPE',
          ),
          message.msgType,
        ): {
          // Fall through to invoke 'BLESS_DECLARATION_REQUEST_IMPORT_MESSAGE_TYPE' logic
        }
        case isOfMessageType(
          this.configService.get(
            'BLESS_DECLARATION_REQUEST_IMPORT_MESSAGE_TYPE',
          ),
          message.msgType,
        ):
          await this.parseDeclarationRequestMessage(message.decodeMessage());
          break;
        default:
          if (
            isOfMessageType(
              this.configService.get('BLESS_HYPERLEDGER_MESSAGE_TYPES'),
              message.msgType,
            )
          ) {
            this.logger.debug(
              `Received default BusinessMessage of msgType: ${message.msgType}`,
            );
            await this.parseHyperledgerEvent(message);
          } else {
            const error = `Received unknown BusinessMessage of msgType: ${message.msgType}`;
            this.logger.error(error);
            throw new Error(error);
          }
      }
      await this.kafkaProducerService.postBlessAck(
        message.id,
        message.msgType,
        blessAckTopic,
      );
    } else if (message instanceof NotificationMessageModelDto) {
      this.logger.debug(
        `Incoming NotificationMessage: ${JSON.stringify(message)}`,
      );
      await this.parseNotification(message);
    } else {
      const error = `Received unknown message payload: ${JSON.stringify(
        message,
      )}`;
      this.logger.error(error);
      throw new Error(error);
    }
  }

  @SubscribeTo(pickupMovementsTopic)
  async incomingPickupFileOrMovement(
    @Payload() messageData: PickupMovementsMessageModelDto,
    _headers: IHeaders,
    _key: string,
    timestamp: string,
  ): Promise<void> {
    this.logger.log(
      'incoming kafka to topic: ' +
        pickupMovementsTopic +
        '- at timestamp: ' +
        timestamp,
    );
    this.logger.debug(
      `Incoming PickupMovementsMessage: ${JSON.stringify(messageData)}`,
    );
    switch (true) {
      case isOfMessageType(
        this.configService.get('BLESS_NEW_PICKUP_MESSAGE_TYPE'),
        messageData.msgType,
      ):
        await this.parseCheckPointMessage(messageData.decodeMessage());
        break;
      case isOfMessageType(
        this.configService.get('BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE'),
        messageData.msgType,
      ):
        await this.parseMasterMovementMessage(messageData.decodeMessage());
        break;
      case isOfMessageType(
        this.configService.get('BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE'),
        messageData.msgType,
      ):
        await this.parseDetailMovementMessage(messageData.decodeMessage());
        break;
      default: {
        const error = `Received unknown message payload: ${JSON.stringify(
          messageData,
        )}`;
        this.logger.error(error);
        throw new Error(error);
      }
    }
  }

  private async parseHyperledgerEvent(
    message: BusinessMessageModelDto,
  ): Promise<void> {
    const payload = JSON.parse(message.decodeMessage());
    this.logger.debug(payload);

    if (!payload.orderNumber) {
      throw Error('Missing order id in Hyperledger event payload');
    }
    if (
      [
        'documenttracking',
        'declaration_json_mapping',
        'claim_request',
        'invoice_data',
        'order_data',
      ].includes(payload.eventType)
    ) {
      await this.commandBus.execute(
        new ProcessHyperledgerEventCommand(
          new OrderAggregateKey(payload.orderNumber, payload.ecomBusinessCode),
          payload.orderNumber,
          payload.invoiceNumber,
          payload.eventType,
          message.msgType,
          payload.txnId,
          payload.data,
        ),
      );
      await this.commandBus.execute(
        new CreateVcIdLookupCommand(
          message.id,
          payload.orderNumber,
          payload.ecomBusinessCode,
          payload.eventType,
        ),
      );
    }
  }

  private async parseOrderMessage(
    message: BusinessMessageModelDto,
  ): Promise<void> {
    const order: SubmitOrder | ReturnOrder | CancelOrder = JSON.parse(
      message.decodeMessage(),
    );
    const orderAggregateKey = new OrderAggregateKey(
      order.orderNumber,
      order.ecomBusinessCode,
    );
    switch (order.mode) {
      case ModeType.Final:
        await this.commandBus.execute(
          new CreateOrderCommand(
            orderAggregateKey,
            order.orderNumber,
            order as SubmitOrder,
          ),
        );
        await this.commandBus.execute(
          new CreateVcIdLookupCommand(
            message.id,
            order.orderNumber,
            order.ecomBusinessCode,
            LookupType.Order,
          ),
        );
        break;
      case ModeType.Return:
        await this.commandBus.execute(
          new SubmitReturnOrderCommand(
            orderAggregateKey,
            order as ReturnOrder,
            message.id,
          ),
        );
        await this.commandBus.execute(
          new CreateVcIdLookupCommand(
            message.id,
            order.orderNumber,
            order.ecomBusinessCode,
            LookupType.ReturnOrder,
          ),
        );
        break;
      case ModeType.Cancel:
        await this.commandBus.execute(
          new CancelOrderCommand(orderAggregateKey, order as CancelOrder),
        );
        await this.commandBus.execute(
          new CreateVcIdLookupCommand(
            message.id,
            order.orderNumber,
            order.ecomBusinessCode,
            LookupType.CancelOrder,
          ),
        );
        break;
      case ModeType.Update:
        await this.commandBus.execute(
          new UpdateOrderCommand(
            orderAggregateKey,
            order.orderNumber,
            order as SubmitOrder,
          ),
        );
        await this.commandBus.execute(
          new CreateVcIdLookupCommand(
            message.id,
            order.orderNumber,
            order.ecomBusinessCode,
            LookupType.UpdateOrder,
          ),
        );
        break;
    }
  }

  private async parseConfirmReturn(
    message: BusinessMessageModelDto,
  ): Promise<void> {
    const order: ConfirmReturnDelivery = JSON.parse(message.decodeMessage());
    await this.commandBus.execute(
      new CreateVcIdLookupCommand(
        message.id,
        order.orderNumber,
        order.ecomBusinessCode,
        LookupType.ConfirmReturn,
        order.invoiceNumber,
      ),
    );
    await this.commandBus.execute(
      new ConfirmReturnDeliveryMessageReceivedCommand(
        new OrderAggregateKey(order.orderNumber, order.ecomBusinessCode),
        message.id,
        order,
      ),
    );
  }

  private async parseExceptionMessage(
    _message: BusinessMessageModelDto,
  ): Promise<void> {
    // Do nothing for now, in the future error persistence should happen in this flow to support for multiple node-setup of backend
    return;
  }

  private async parseNotification(
    message: NotificationMessageModelDto,
  ): Promise<void> {
    if (message.type === NotificationType.processed) {
      await this.commandBus.execute(new PerformVcIdLookupCommand(message.id));
    }
  }

  private async parseCheckPointMessage(messages: string): Promise<void> {
    const houseBillDataArray: CheckPointFile[] = JSON.parse(messages);
    for (const houseBillData of houseBillDataArray) {
      if (isNaN(Number(houseBillData.numberOfPackages))) {
        this.logger.error(
          'HouseBillData field numberOfPackages cannot be parsed to a number',
        );
        return;
      }
      const { shipperReference, ecomBusinessCode } = houseBillData;
      const orderAggregateKey = new OrderAggregateKey(
        shipperReference,
        houseBillData.ecomBusinessCode,
      );
      switch (houseBillData.eventCode) {
        case 'PU':
          this.logger.log('Pickup File received');
          await this.commandBus.execute(
            new ProcessPickupFileCommand(orderAggregateKey, houseBillData),
          );

          await this.commandBus.execute(
            new CreateAirwayBillToOrderIdLookupCommand(
              houseBillData.hawb,
              shipperReference,
              ecomBusinessCode,
            ),
          );
          break;
        case 'OK':
          this.logger.log('Delivered notification received');
          await this.commandBus.execute(
            new ProcessDeliveredCommand(
              orderAggregateKey,
              shipperReference,
              houseBillData,
            ),
          );
          break;
        case 'NH':
        case 'CA':
        case 'RD':
        case 'BA':
          this.logger.log('Undelivered notification received');
          await this.commandBus.execute(
            new ProcessUndeliveredCommand(
              orderAggregateKey,
              shipperReference,
              houseBillData,
            ),
          );
          break;
        case 'DF':
          this.logger.log('DF notification received');
          await this.commandBus.execute(
            new ProcessDfCheckpointFileCommand(
              orderAggregateKey,
              houseBillData,
            ),
          );
          break;
        default:
          await this.commandBus.execute(
            new ProcessOtherCheckpointFileCommand(
              orderAggregateKey,
              houseBillData,
            ),
          );
          break;
      }
    }
  }

  private async parseMasterMovementMessage(messages: string): Promise<void> {
    const movementDataArray = JSON.parse(messages);
    for (const movementData of movementDataArray) {
      const airwayBillNumbers = recursiveSearch(
        movementData,
        'AirwayBillNumber',
      );

      const item = movementData.payload.items.find((x) => x);
      if (!item) this.logger.error('movement item is empty');

      const transformedMovementData: MasterMovement = {
        mawbNumber: item.MawbNumber,
        movementDepartureDate: item.MovementDepartureDate,
        movementDepartureTime: item.MovementDepartureTime,
        movementNumber: item.MovementNumber,
        movementOrigin: item.MovementOrigin,
        movementOriginCountry: item.MovementOriginCountry,
        movementDestination: item.MovementDestination,
        movementGMT: item.MovementGMT,
        weightUnit: item.WeightUnit,
        volumeUnit: item.VolumeUnit,
        handlingUnits: item.HandlingUnit.map((handlingUnit) => {
          return {
            handlingUnitNumber: handlingUnit.HandlingUnitNumber,
            handlingUnitType: handlingUnit.HandlingUnitType,
            handlingUnitRegNumber: handlingUnit.HandlingUnitRegNumber,
            handlingUnitParent: handlingUnit.HandlingUnitParent,
          };
        }),
      };
      await this.commandBus.execute(
        new CreateMawbToAirwaynumsLookupCommand(
          transformedMovementData.mawbNumber,
          airwayBillNumbers,
        ),
      );

      // For the master movement we only store the general data that is the same for each airwaybillnumber
      const uniqueAirwayBillNumbers = new Set(airwayBillNumbers);
      for (const airwayBillNumber of uniqueAirwayBillNumbers) {
        this.commandBus.execute(
          new PerformAirwayBillNoToOrderIdLookupMovementCommand(
            airwayBillNumber,
            transformedMovementData,
          ),
        );
      }
    }
  }

  private async parseDetailMovementMessage(messages: string): Promise<void> {
    const movementDataArray = JSON.parse(messages);

    const detailMovements: DetailMovement[] = movementDataArray.map(
      (movementData) => {
        return {
          airwayBillNumber: movementData.AirwayBillNumber,
          shipmentOrigin: movementData.ShipmentOrigin,
          shipmentOriginCountry: movementData.ShipmentOriginCountry,
          shipmentDestination: movementData.ShipmentDestination,
          shipmentWeight: movementData.ShipmentWeight,
          shipmentActualWeight: movementData.ShipmentActualWeight,
          shipmentDeclaredVolumeWeight:
            movementData.ShipmentDeclaredVolumeWeight,
          shipmentTotalVolumeMetricWeight:
            movementData.ShipmentTotalVolumeMetricWeight,
          incoterm: movementData.Incoterm,
          totalPiecesInShipment: movementData.TotalPiecesInShipment,
          item: {
            unitOfMeasure: movementData.Item.UnitOfMeasure,
          },
          shipperRef: movementData.ShipperRef.map((sr) => {
            return {
              shipmentRef: sr.ShipmentRef,
              qualifier: sr.Qualifier,
            };
          }),
          mawbNumber: movementData.MawbNumber,
          handlingUnitNumber: movementData.HandlingUnitNumber,
        };
      },
    );

    detailMovements.forEach((detailMovement) => {
      this.commandBus.execute(
        new PerformMawbAirwayNumsLookupCommand(
          detailMovement.mawbNumber,
          detailMovement,
        ),
      );
    });
  }

  private async parseDeclarationRequestMessage(
    messages: string,
  ): Promise<void> {
    // Message should always contain one Declaration Request
    const declarationRequest = JSON.parse(messages)[0]
      .body as DHLEDeclarationRequest;
    const outboundAirwayBillNumber =
      declarationRequest.Declaration.Consignments.DeclarationDetails
        .TransportDocumentDetails[0].OutboundTransportDocumentNo;
    const inboundAirwayBillNumber =
      declarationRequest.Declaration.Consignments.DeclarationDetails
        .TransportDocumentDetails[0].InboundTransportDocumentNo;

    const airwayBillNumber =
      outboundAirwayBillNumber ?? inboundAirwayBillNumber;

    if (!airwayBillNumber) {
      throw new Error(
        `No airwayBillNumber found in incoming Declaration Request: ${JSON.stringify(
          declarationRequest,
        )}`,
      );
    }

    this.commandBus.execute(
      new PerformAirwayBillNoToOrderIdLookupDHLECommand(
        airwayBillNumber,
        declarationRequest,
      ),
    );
  }
}
