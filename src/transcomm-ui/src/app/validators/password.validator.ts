import { AbstractControl } from '@angular/forms';
import { UserRole } from 'core/viewEnums';


interface PasswordError {
  passLength: null | { valid: boolean; msg: string };
  criteriaMatch: null | { valid: boolean; msg: string; criteriaScore: number };
}

const lowerCaseCharMatch = /(?=.*[a-z])/;
const upperCaseCharMatch = /(?=.*[A-Z])/;
const numCharMatch = /(?=.*\\d)/;
const specialCharMatch = /(?=.*[\\~@#%^&*()_=+[{}|;:'",.<>/?!$\]-])/;

/** 
 * Password needs to contain at least 3 of the following criteria: 
 * 
 *  a. Uppercase letters.
 * 
 *  b. Lowercase letters.
 * 
 *  c. Numbers.
 * 
 *  d. Special characters (\\~@#%^&*()_=+[{}|;:\'",.<>/?!$/]-).
 **/
export function validatePassword(role: UserRole): (c: AbstractControl) => PasswordError | null {
  const minLen = ['admin', 'super_admin'].includes(role) ? 16 : 8;
  const errMsgs = [
    `Password minimum length is ${minLen}.`,
    `Password needs to contain at least 3 of the following criteria: \n a. Uppercase letters. \n b. Lowercase letters. \n c. Numbers. \n d. Special characters (\\~@#%^&*()_=+[{}|;:'",.<>/?!$/]-).`,
  ];
  const criterias = [
    lowerCaseCharMatch,
    upperCaseCharMatch,
    numCharMatch,
    specialCharMatch,
  ];

  return (c: AbstractControl) => {
    const out: PasswordError = { passLength: null, criteriaMatch: null };
    let criteriaScore = 0;
    if (c.value.length < minLen) {
      out.passLength = {
        valid: false,
        msg: errMsgs[0],
      };
    }
    for (const criteria of criterias) {
      if (criteria.test(c.value)) {
        criteriaScore += 1;
      }
    }
    if (criteriaScore < 3) {
      out.criteriaMatch = {
        valid: false,
        msg: errMsgs[1],
        criteriaScore,
      };
    }
    if (out.passLength === null && out.criteriaMatch === null) {
      return null;
    } else {
      return out;
    }
  };
}
