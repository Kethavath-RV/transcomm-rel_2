import * as Joi from 'joi';

const envVarsSchema = Joi.object()
  .keys({
    SERVER_PORT: Joi.number().positive().required(),
    BLESS_URL: Joi.string().uri().required(),
    BLESS_ROUTE: Joi.string().required(),
    BLESS_AUTH: Joi.string().required(),
    BLESS_KID: Joi.string().required(),
    BLESS_NEW_ORDER_MESSAGE_TYPE: Joi.string().required(),
    BLESS_ISSUER: Joi.string().required(),
    BLESS_APPLICATION: Joi.string().required(),
    SUBJECT_PRIMARY: Joi.string().required(),
  })
  .unknown();

export function validateEnvironmentVariables(config: Record<string, unknown>) {
  console.log('Validating environment variables from docker-compose...');
  const { value: _, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(config);

  if (error) {
    throw new Error(
      `Environment variables validation errors: ${error.message}`,
    );
  }
}
