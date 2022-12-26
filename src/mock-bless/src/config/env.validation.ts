import * as Joi from 'joi';

const envVarsSchema = Joi.object()
  .keys({
    KAFKA_TOPIC_CUSTOMS: Joi.string().required(),
    KAFKA_TOPIC_PICKUPS_MOVEMENTS: Joi.string().required(),
    KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT: Joi.string().required(),
    KAFKA_BROKERS: Joi.string().required(),
    KAFKA_GROUP_ID: Joi.string().required(),
    BUSINESS_EXCEPTION_MSG_TYPE: Joi.string().required(),
    BLESS_DECLARATION_REQUEST_EXPORT_MESSAGE_TYPE: Joi.string().required(),
    BLESS_DECLARATION_REQUEST_IMPORT_MESSAGE_TYPE: Joi.string().required(),
    BLESS_NEW_PICKUP_MESSAGE_TYPE: Joi.string().required(),
    BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE: Joi.string().required(),
    BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE: Joi.string().required(),
  })
  .unknown();

export function validateEnvironmentVariables(config: Record<string, unknown>) {
  console.log('Validating environment variables from docker-compose...');
  const { value: _, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(config);

  if (error) {
    throw new Error(`Environment variables validation error: ${error.message}`);
  }
  console.log('Validation passed');
}
