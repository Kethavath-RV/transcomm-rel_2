import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  KAFKA_TOPIC_CUSTOMS: string;

  @IsNotEmpty()
  @IsString()
  KAFKA_TOPIC_PICKUPS_MOVEMENTS: string;

  @IsNotEmpty()
  @IsString()
  KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_URL: string;

  @IsNotEmpty()
  @IsString()
  BLESS_NEW_ORDER_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  BLESS_HYPERLEDGER_MESSAGE_TYPES: string;

  @IsNotEmpty()
  @IsString()
  BLESS_NEW_PICKUP_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  BLESS_DECLARATION_REQUEST_EXPORT_MESSAGE_TYPE;

  @IsNotEmpty()
  @IsString()
  BLESS_DECLARATION_REQUEST_IMPORT_MESSAGE_TYPE;

  @IsNotEmpty()
  @IsString()
  BLESS_DECLARATION_RESPONSE_EXPORT_MESSAGE_TYPE;

  @IsNotEmpty()
  @IsString()
  BLESS_DECLARATION_RESPONSE_IMPORT_MESSAGE_TYPE;

  @IsNotEmpty()
  @IsString()
  EVENTSTORE_CONNECTION_STRING: string;

  @IsNotEmpty()
  @IsString()
  AUTO_RETRIES_INTERVAL: string;

  @IsNotEmpty()
  @IsNumberString()
  AUTO_RETRIES: string;

  @IsNotEmpty()
  @IsEmail()
  SUPERADMIN_EMAIL: string;

  @IsNotEmpty()
  @IsString()
  SUPERADMIN_HASHED_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  LOGGING_LEVEL: string;

  @IsNotEmpty()
  @IsString()
  BUSINESS_EXCEPTION_MSG_TYPE: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_SENDER_IDENTITY: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_RECEIVERS: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_EXCEPTION_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_EXCEPTION_RECEIVERS: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_APPLICATION_ID: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_AUDIENCE: string;

  @IsNotEmpty()
  @IsBooleanString()
  DATAGEN_ACTIVE: string;
}

export function validate(config: Record<string, unknown>) {
  Logger.log('Validating environment variables from docker-compose...');
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    Logger.error(
      `Environment variables validation error: ${errors.toString()}`,
    );
    throw new Error(
      `Environment variables validation error: ${errors.toString()}`,
    );
  }
  Logger.log('Validation passed');
  return validatedConfig;
}
