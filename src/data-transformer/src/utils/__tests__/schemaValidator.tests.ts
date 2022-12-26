import { ModeType } from 'core';
import {
  validateConfirmReturnDeliveryData,
  validateData,
  validateHSCode,
  validateHSCodeString,
} from 'data-transformer/src/validation/schemaValidator';
import {
  invalidCountryEnumCodeFinal,
  invalidTypeInputFinal,
  validInput,
  overMaxItemsInputFinal,
  validInputReturn,
  invalidInputReturnAddedFields,
  validInputCancelOrder,
  invalidInputCancelOrderMissingInvoiceNumber,
  validInputConfirmReturnDelivery,
  invalidInputConfirmReturnDeliveryMissingTransportDocAndReturnRequestNumbers,
  invalidHSCodeInput,
  validHSCodeInput,
  noEcomInputFinal,
} from '../testInput/validatorInput';

test('Mode=Final - Correct Order json should pass validator', () => {
  expect(validateData(JSON.parse(validInput))).toEqual('Success');
});

test('Mode not in final, return or cancel should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.mode = ModeType.Basic;
  data.invoices[0].mode = ModeType.Basic;
  data.invoices[0].lineItems[0].mode = ModeType.Basic;
  expect(validateData(data)).toEqual('"Not in mode Final, Return, Update or Cancel"');
});

test('No ordernumber should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.orderNumber = '';
  expect(validateData(data)).toEqual('"No ordernumber present on order"');
});

test('Data with wrong time should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.actionDate = "2021-10-15T 11:09:06";
  expect(validateData(data)).not.toEqual('Success');
});

test('Data with correct time should pass validator', () => {
  const data = JSON.parse(validInput);
  data.actionDate = "2021-10-15T11:09:06Z";
  expect(validateData(data)).toEqual('Success');
});

test('Mode not all in Basic for order mode=basic should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.mode = ModeType.Basic;
  data.invoices[0].mode = ModeType.Final;
  data.invoices[0].lineItems[0].mode = ModeType.Final;
  expect(validateData(data)).toEqual(
    '"If order is in mode `B`, invoice and lineItems must be in mode `B`"',
  );
});

test('Mode not all in Final for order mode=final should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.mode = ModeType.Final;
  data.invoices[0].mode = ModeType.Basic;
  data.invoices[0].lineItems[0].mode = ModeType.Final;
  expect(validateData(data)).toEqual(
    '"If order is in mode `F`, invoice and lineItems must be in mode `F`"',
  );
});

test('Mode not all in Update or Cancel for order mode=update should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.mode = ModeType.Update;
  data.invoices[0].mode = ModeType.Basic;
  data.invoices[0].lineItems[0].mode = ModeType.Final;
  expect(validateData(data)).toEqual(
    '"If order is in mode `U`, invoice and lineItems must be in mode `U` or `C`"',
  );
});

test('Mode not all in Return for order mode=return should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.mode = ModeType.Return;
  data.invoices[0].mode = ModeType.Basic;
  data.invoices[0].lineItems[0].mode = ModeType.Final;
  expect(validateData(data)).toEqual(
    '"If order is in mode `R`, invoice and lineItems must be in mode `R`"',
  );
});

test('Mode=Final - Incorrect Type for Ordernumber should not pass validator', () => {
  expect(validateData(invalidTypeInputFinal)).not.toEqual('Success');
});

test('Mode=Final - No ecomCode should not pass validator', () => {
  expect(validateData(noEcomInputFinal)).not.toEqual('Success');
});

test('Mode=Final - No ecomCode should not pass validator', () => {
  expect(validateData(noEcomInputFinal)).not.toEqual('Success');
});

test('Mode=Final - Over maxlength for referenceId should not pass validator', () => {
  const data = JSON.parse(validInput);
  data.referenceId = new Array(100 + 2).join('c');
  expect(validateData(data)).not.toEqual('Success');
});

test('Mode=Final - Country code not in enum should not pass validator', () => {
  expect(validateData(invalidCountryEnumCodeFinal)).not.toEqual('Success');
});

test('Mode=Final - Number of documents in array over maxitems should not pass validator', () => {
  expect(validateData(overMaxItemsInputFinal)).not.toEqual('Success');
});

test('Mode=Return - Correct Order json should pass validator', () => {
  expect(validateData(validInputReturn)).toEqual('Success');
});

test('Mode=Return - Additional fields in json should not pass validator', () => {
  expect(validateData(invalidInputReturnAddedFields)).not.toEqual('Success');
});

test('Mode=Cancel - Correct Order json should pass validator', () => {
  expect(validateData(validInputCancelOrder)).toEqual('Success');
});

test('Mode=Cancel - Missing required fields in json should not pass validator', () => {
  expect(validateData(invalidInputCancelOrderMissingInvoiceNumber)).not.toEqual(
    'Success',
  );
});

test('ConfirmReturnDelivery - Correct Order json should pass validator', () => {
  expect(
    validateConfirmReturnDeliveryData(validInputConfirmReturnDelivery),
  ).toEqual('Success');
});

test('No ordernumber should not pass validator - validateConfirmReturnDeliveryData', () => {
  const data = validInputConfirmReturnDelivery;
  data.orderNumber = '';
  expect(validateConfirmReturnDeliveryData(data)).toEqual(
    '"No ordernumber present on order"',
  );
});

test('ConfirmReturnDelivery - Missing required fields in json should not pass validator', () => {
  expect(
    validateConfirmReturnDeliveryData(
      invalidInputConfirmReturnDeliveryMissingTransportDocAndReturnRequestNumbers,
    ),
  ).not.toEqual('Success');
});

test('HSCode - Correct HSCode should pass validator and have dots removed', () => {
  expect(validateData(validHSCodeInput)).toEqual('Success');
  expect(validHSCodeInput.invoices[0].lineItems[0].hscode).toEqual('1012110');
});

test('HSCode - Incorrect HSCode should not pass validator', () => {
  expect(validateData(invalidHSCodeInput)).not.toEqual('Success');
  expect(invalidHSCodeInput.invoices[0].lineItems[0].hscode).not.toEqual(
    '1012110',
  );
});

test('ValidateHSCode - Should have dots removed', () => {
  validateHSCode(validHSCodeInput);
  expect(validHSCodeInput.invoices[0].lineItems[0].hscode).toEqual('1012110');
});

test('ValidateHSCode - Should throw error if incorrect hscode after heuristic applied', () => {
  expect(() => validateHSCode(invalidHSCodeInput)).toThrowError();
});

test('validateHSCodeString - Should have dots removed and zeros appended until correct', () => {
  expect(validateHSCodeString('101.30.99')).toEqual('1013000');
});

test('validateHSCodeString - Should not try heuristic more than 4 times', () => {
  expect(() => validateHSCodeString('1.2.3')).toThrowError();
});
