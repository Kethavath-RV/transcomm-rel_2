import { FormControl } from '@angular/forms';
import { ValidationMessage } from '.';

const invalidMsg = {
  validateEmail: {
    valid: false,
    msg: 'Invalid email.'
  }
}


export type EmailValidator = null | {
  validateEmail: ValidationMessage;
}

export function validateEmail(c: FormControl): EmailValidator {
  const split_email = c.value.split('@');

  if (split_email.length !== 2) {
    return invalidMsg;
  }
  
  const re_1 = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))$/;
  const re_2 = /^((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  const [email_1, email_2] = split_email;
  return re_1.test(email_1) && re_2.test(email_2) ? null : invalidMsg;
}