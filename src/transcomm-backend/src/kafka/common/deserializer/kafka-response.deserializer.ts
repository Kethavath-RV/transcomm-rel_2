/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Logger } from '@nestjs/common';
import { Deserializer } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ValidationResult } from 'core';
import { KafkaResponse } from 'kafka/common/interfaces';
import { IHeaders, KafkaMessage } from 'kafkajs';
import { BusinessMessageModelDto } from '../validation/businessMessageModelSchema';
import { NotificationMessageModelDto } from '../validation/notificationMessageModelSchema';
import { PickupMovementsMessageModelDto } from '../validation/pickupMovementMessageModelDto';

export class KafkaResponseDeserializer
  implements Deserializer<any, KafkaResponse>
{
  private readonly logger = new Logger(this.constructor.name);

  deserialize(message: KafkaMessage): KafkaResponse {
    this.logger.log('Incoming kafka message on deserializer.');
    const { key, value, timestamp, offset, headers } = message;

    if (!value || !Buffer.isBuffer(value)) {
      throw Error(`KakaMessage failed to Deserialize missing value/key`);
    }
    const id = key ? Buffer.from(key).toString() : '';
    const response = Buffer.from(value).toString();

    const messageData = JSON.parse(response);
    this.logger.debug('messageData: ' + JSON.stringify(messageData));

    if (headers) {
      const messageCategory = headers['MESSAGE_CATEGORY']?.toString();
      if (messageCategory === 'NOTIFICATION') {
        const notificationMessageParseResult =
          this.parseNotification(messageData);
        if (notificationMessageParseResult[0] === ValidationResult.Pass) {
          return this.parsedMessage(
            id,
            notificationMessageParseResult[1],
            timestamp,
            offset,
            headers,
          );
        }
      }
    }

    const businessMessageParseResult = this.parseBusinessMessage(messageData);
    if (businessMessageParseResult[0] === ValidationResult.Pass) {
      return this.parsedMessage(
        id,
        businessMessageParseResult[1],
        timestamp,
        offset,
        headers,
      );
    }

    const pickupMovementMessageParseResult =
      this.parsePickupMovementsMessageModel(messageData);
    if (pickupMovementMessageParseResult[0] === ValidationResult.Pass) {
      return this.parsedMessage(
        id,
        pickupMovementMessageParseResult[1],
        timestamp,
        offset,
        headers,
      );
    }

    throw Error(
      `Could not parse kafka message:\n ${JSON.stringify(messageData)}`,
    );
  }

  private parseNotification(
    message: any,
  ): [ValidationResult, NotificationMessageModelDto | null] {
    const notification = plainToInstance(NotificationMessageModelDto, message);
    const validationResults = validateSync(notification);
    if (validationResults.length > 0) return [ValidationResult.Fail, null];
    return [ValidationResult.Pass, notification];
  }

  private parseBusinessMessage(
    message: any,
  ): [ValidationResult, BusinessMessageModelDto | null] {
    const businessMessage = plainToInstance(BusinessMessageModelDto, message);
    const validationResults = validateSync(businessMessage);
    if (validationResults.length > 0) return [ValidationResult.Fail, null];
    return [ValidationResult.Pass, businessMessage];
  }

  private parsePickupMovementsMessageModel(
    message: any,
  ): [ValidationResult, PickupMovementsMessageModelDto | null] {
    const pickupMovementsMessage = plainToInstance(
      PickupMovementsMessageModelDto,
      message,
    );
    const validationResults = validateSync(pickupMovementsMessage);
    if (validationResults.length > 0) return [ValidationResult.Fail, null];
    return [ValidationResult.Pass, pickupMovementsMessage];
  }

  private parsedMessage(
    id: string,
    messageData: any,
    timestamp: string,
    offset: string,
    headers?: IHeaders,
  ): KafkaResponse {
    return {
      key: id,
      response: messageData,
      timestamp,
      offset,
      headers,
    };
  }
}
