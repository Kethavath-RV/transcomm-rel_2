import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutputMessageModel } from 'core';
import { createHash, randomBytes } from 'crypto';
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
  private topic =
    this.configService.get('KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT') ??
    'BlessAckTopic'; //Common output topic

  public async post<T>(
    payload: T,
    collection: string,
    eventName: string,
  ): Promise<void> {
    let messageTypeSuffix = 'MESSAGE_TYPE';
    let messageReceivers = [this.receivers];
    if (eventName === 'BUSINESS' && collection === 'EXCEPTION') {
      messageTypeSuffix = 'MSG_TYPE';
      messageReceivers = this.errorReceivers.split(',');
    }

    const messageType = this.configService.get(
      `${eventName}_${collection}_${messageTypeSuffix}`,
    );

    if (!messageType || messageType === '') {
      this.logger.error(
        `Unable to find messageType from env for eventName: ${eventName}, collection: ${collection}`,
      );
      return;
    }

    const messageData: OutputMessageModel = {
      id: this.generateVcId(this.senderId, this.applicationId),
      msgType: messageType,
      payloads: this.encodePayload(payload),
      audience: this.audience,
      receivers: {
        primary: messageReceivers,
        secondary: [],
      },
      primary: true,
      applicationId: this.applicationId,
      sender: this.senderId,
      issueTimeFLag: true,
    };
    const stringifiedMessageData = JSON.stringify(messageData);

    this.logger.debug(
      'KafkaMessage being sent to Bless from Datagen:' +
        stringifiedMessageData +
        '- With payload: ' +
        JSON.stringify(payload),
    );

    await this.kafkaProducerService.post(stringifiedMessageData, this.topic);
  }

  private encodePayload<T>(payload: T): string[] {
    return [encodeBase64(JSON.stringify(payload))];
  }

  private generateVcId(senderId: string, applicationId: string): string {
    if (!senderId || !applicationId || senderId === '' || applicationId === '')
      throw new Error('No senderId or applicationId set when generating vcId');
    return createHash('sha256')
      .update(
        `${senderId}#${applicationId}#${Date.now()}#${this.randomString()}`,
      )
      .digest('hex');
  }

  private randomString(): string {
    return randomBytes(8).toString('hex');
  }
}
