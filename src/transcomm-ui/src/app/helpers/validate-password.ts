import { UserRole } from 'core/viewEnums';

const lowerUpperDigits = new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);
const lowerUpperDigitsSpecial = new RegExp(
  /(?=.*[a-zA-Z])(?=.*\d)(?=.*[\\~@#%^&*()_=+[{}|;:'",.<>/?!$/\]-])/,
);
const lowerUpperSpecial = new RegExp(
  /(?=.*[\\~@#%^&*()_=+[{}|;:'",.<>/?!$\]-])(?=.*[a-z])(?=.*[A-Z])/,
);

/** 
 Password needs to contain at least 3 of the following criteria: 
 a. Uppercase letters. 
 b. Lowercase letters. 
c. Numbers. 
 d. Special characters (\\~@#%^&*()_=+[{}|;:\'",.<>/?!$/]-).
 **/
const passwordRegex = new RegExp(
  lowerUpperDigits.source +
    '|' +
    lowerUpperDigitsSpecial.source +
    '|' +
    lowerUpperSpecial.source,
);

const minLength = (role: UserRole): number => {
  return role === 'admin' || role === 'super_admin' ? 16 : 8;
};

export function validatePassword(password: string, role: UserRole): boolean {
  if (!password) {
    return false;
  }

  return password.length >= minLength(role) && passwordRegex.test(password);
}

export function getPasswordErrorMessage(role: UserRole): string {
  return (
    'Password needs to contain at least 3 of the following criteria: \n a. Uppercase letters. \n b. Lowercase letters. \n c. Numbers. \n d. Special characters (\\~@#%^&*()_=+[{}|;:\'",.<>/?!$/]-). Password minimum length is ' +
    minLength(role) +
    '.'
  );
}
