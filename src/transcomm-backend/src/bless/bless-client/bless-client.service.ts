import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeclarationResponse, Direction, OutputMessageModel } from 'core';
import { generateVcId } from 'helpers/generateVcId';
import { ProducerService } from 'kafka/producer/producer.service';

const encodeBase64 = require('btoa');

@Injectable()
export class BlessClientService {
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly configService: ConfigService,
    private kafkaProducerService: ProducerService,
  ) {}

  private senderId =
    this.configService.get('DATAGEN_KAFKA_SENDER_IDENTITY') ?? 'DC-TC';
  private applicationId =
    this.configService.get('DATAGEN_APPLICATION_ID') ?? 'DC-TC';
  private audience =
    this.configService.get('DATAGEN_KAFKA_AUDIENCE') ?? 'DHL-EXP';
  private receivers =
    this.configService.get('DATAGEN_KAFKA_RECEIVERS') ?? 'DHL-EXP';
  private errorReceivers =
    this.configService.get('DATAGEN_KAFKA_EXCEPTION_RECEIVERS') ??
    'DHL-EXP,LUXC_DXB';
  private businessExceptionMsgType =
    this.configService.get('BUSINESS_EXCEPTION_MSG_TYPE') ?? 'ROR';
  private commonOutputTopic =
    this.configService.get('KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT') ??
    'BlessAckTopic'; //Common output topic
  private declarationResponseExportMsgType =
    this.configService.get('BLESS_DECLARATION_RESPONSE_EXPORT_MESSAGE_TYPE') ??
    'TC_DHLE_ODAT_EXC_EXPORT';
  private declarationResponseImportMsgType =
    this.configService.get('BLESS_DECLARATION_RESPONSE_IMPORT_MESSAGE_TYPE') ??
    'TC_DHLE_ODAT_EXC_EXPORT';

  public async postError<T>(payload: T, vcId?: string): Promise<void> {
    const messageData: OutputMessageModel = {
      id: vcId ?? generateVcId(this.senderId, this.applicationId),
      msgType: this.businessExceptionMsgType,
      payloads: this.encodePayload(payload),
      audience: this.audience,
      receivers: {
        primary: this.errorReceivers.split(','),
        secondary: [],
      },
      primary: true,
      applicationId: this.applicationId,
      sender: this.senderId,
      issueTimeFLag: true,
    };
    const stringifiedMessageData = JSON.stringify(messageData);

    this.logger.log(
      'Error message being sent to Bless Common App output Topic from Transcomm Backend:' +
        stringifiedMessageData +
        '- With payload: ' +
        JSON.stringify(payload),
    );

    await this.kafkaProducerService.post(
      stringifiedMessageData,
      this.commonOutputTopic,
    );
  }

  public async postDeclarationResponse(
    payload: DeclarationResponse,
    direction: Direction,
    vcId?: string,
  ): Promise<void> {
    const messageData: OutputMessageModel = {
      id: vcId ?? generateVcId(this.senderId, this.applicationId),
      msgType:
        direction === Direction.Return
          ? this.declarationResponseImportMsgType
          : this.declarationResponseExportMsgType,
      payloads: this.encodePayload(payload),
      audience: this.audience,
      receivers: {
        primary: [this.receivers],
        secondary: [],
      },
      primary: true,
      applicationId: this.applicationId,
      sender: this.senderId,
      issueTimeFLag: true,
    };
    const stringifiedMessageData = JSON.stringify(messageData);

    this.logger.debug(
      'Declaration response message being sent to Bless Common App output Topic from Transcomm Backend:' +
        stringifiedMessageData +
        '- With payload: ' +
        JSON.stringify(payload),
    );

    await this.kafkaProducerService.post(
      stringifiedMessageData,
      this.commonOutputTopic,
    );
  }

  private encodePayload<T>(payload: T): string[] {
    return [encodeBase64(JSON.stringify(payload))];
  }
}
