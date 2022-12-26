/* eslint-disable @typescript-eslint/ban-types */
import {
  validatePassword,
  getPasswordErrorMessage,
} from '../validate-password';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    return validatePassword(
      password,
      JSON.parse(JSON.stringify(args.object)).role,
    );
  }

  defaultMessage(args: ValidationArguments) {
    return getPasswordErrorMessage(
      JSON.parse(JSON.stringify(args.object)).role,
    );
  }
}

export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PasswordValidator,
    });
  };
}
