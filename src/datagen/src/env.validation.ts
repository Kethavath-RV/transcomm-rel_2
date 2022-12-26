import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  QUEUE_HOST: string;

  @IsNotEmpty()
  @IsNumberString()
  QUEUE_PORT: string;

  @IsNotEmpty()
  @IsString()
  KAFKA_BROKERS: string;

  @IsNotEmpty()
  @IsString()
  KAFKA_GROUP_ID: string;

  @IsNotEmpty()
  @IsString()
  HYPERLEDGER_URL: string;

  @IsNotEmpty()
  @IsString()
  HYPERLEDGER_CLIENT_ID: string;

  @IsNotEmpty()
  @IsString()
  HYPERLEDGER_CHANNEL_NAME: string;

  @IsNotEmpty()
  @IsString()
  HYPERLEDGER_CHAINCODE_NAME: string;

  @IsNotEmpty()
  @IsString()
  HYPERLEDGER_USER_ID: string;

  @IsNotEmpty()
  @IsString()
  HYPERLEDGER_ORGANIZATION_CODE: string;

  @IsNotEmpty()
  @IsNumberString()
  AXIOS_RETRY_COUNT: string;

  @IsNotEmpty()
  @IsNumberString()
  AUTO_RETRIES: string;

  @IsNotEmpty()
  @IsString()
  AUTO_RETRIES_INTERVAL: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_URL: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_PUBLIC_URL: string;

  @IsNotEmpty()
  @IsString()
  KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_SENDER_IDENTITY: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_RECEIVERS: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_APPLICATION_ID: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_EXCEPTION_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_AUDIENCE: string;

  @IsNotEmpty()
  @IsString()
  DATAGEN_KAFKA_EXCEPTION_RECEIVERS: string;

  @IsNotEmpty()
  @IsString()
  SUBMITORDER_ORDER_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  SUBMITORDER_INVOICE_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATETRANSPORTINFO_ORDER_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATETRANSPORTINFO_INVOICE_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATETRANSPORTINFO_DECLARATION_JSON_MAPPING_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATETRANSPORTINFO_DOCUMENTTRACKING_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  INITIATEDECLARATION_ORDER_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  INITIATEDECLARATION_DECLARATION_JSON_MAPPING_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  INITIATEDECLARATION_DOCUMENTTRACKING_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  INITIATEDECLARATION_INVOICE_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATEEXITCONFIRMATION_DOCUMENTTRACKING_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATEEXITCONFIRMATION_CLAIM_REQUEST_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATEEXITCONFIRMATION_INVOICE_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  DELIVERORDER_INVOICE_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  DELIVERORDER_ORDER_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  CONFIRMRETURNDELIVERY_ORDER_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  CONFIRMRETURNDELIVERY_INVOICE_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  DECLARATION_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  CLAIM_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  UPDATEEXITCONFIRMATION_ORDER_DATA_MESSAGE_TYPE: string;

  @IsNotEmpty()
  @IsString()
  LOGGING_LEVEL: string;

  @IsNotEmpty()
  @IsNumberString()
  HL_QUEUE_RETRY_ATTEMPTS: string;

  @IsNotEmpty()
  @IsNumberString()
  HL_QUEUE_RETRY_DELAY: string;

  @IsNotEmpty()
  @IsString()
  HASHICORP_VAULT_URL: string;

  @IsNotEmpty()
  @IsString()
  HASHICORP_SECRET_ADDRESS: string;

  @IsNotEmpty()
  @IsString()
  HASHICORP_DHL_CODE_LOOKUP: string;

  @IsNotEmpty()
  @IsString()
  HASHICORP_SHARED_KEY_LOOKUP: string;

  @IsNotEmpty()
  @IsString()
  HASHICORP_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  HASHICORP_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  HASHICORP_ROOT_PATH: string;
}

export function validate(config: Record<string, unknown>) {
  Logger.log('Validating environment variables from docker-compose...');
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
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
